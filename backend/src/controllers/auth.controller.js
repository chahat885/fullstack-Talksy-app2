import User from "../models/user.model.js";

// In-memory store for pending users (email as key)
const pendingUsers = {};
// Removed Otp model import
import bcryptjs from "bcryptjs";
import {generateToken}   from "../lib/utils.js";
import  {sendOtpEmail } from "../lib/sendemail.js";
import { v2 as cloudinary } from "cloudinary";

// @desc Auth user & get token
// @route POST /api/auth/signup
// @access Public
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Backend email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min expiry

    // Store pending user in memory
    pendingUsers[email] = {
      fullName,
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
    };

    // Send OTP to user's email
    await sendOtpEmail(email, otp);

    res.status(201).json({ 
      message: "OTP sent to your email. Please verify to complete registration."
    });
  } catch (error) {
    console.error("Error in signup controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc Verify OTP
// @route POST /api/auth/verify-otp
// @access Public
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const pending = pendingUsers[email];
    if (!pending) {
      return res.status(400).json({ message: "No pending registration found for this email." });
    }
    // Check if user already exists (should not happen)
    const userExists = await User.findOne({ email });
    if (userExists) {
      delete pendingUsers[email];
      return res.status(400).json({ message: "User already exists. Please login." });
    }
    // OTP match and not expired
    if (pending.otp === otp && pending.otpExpiry > Date.now()) {
      const user = new User({
        fullName: pending.fullName,
        email: pending.email,
        password: pending.password,
        isVerified: true,
        otp: null,
        otpExpiry: null,
      });
      await user.save();
      delete pendingUsers[email];
      generateToken(user._id, res);
      return res.status(200).json({ 
        message: "Email verified successfully!",
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        isVerified: user.isVerified,
      });
    } else {
      // OTP not match or expired
      return res.status(400).json({ message: "Invalid or expired OTP! SignUp Again" });
    }
  } catch (error) {
    console.error("Error in verifyOtp controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc Auth user & get token
// @route POST /api/auth/login
// @access Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Use .select('+password') to retrieve the password field
    const user = await User.findOne({ email }).select("+password");
    
    // Handle cases where the user doesn't exist or password doesn't match
    if (!user || !(await bcryptjs.compare(password, user.password || ""))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      // If not verified, re-send OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpiry = Date.now() + 10 * 60 * 1000;
      await user.save();
      await sendOtpEmail(email, otp);
      return res.status(400).json({ message: "Your account is not verified. A new OTP has been sent to your email." });
    }

    // Generate token and set cookie
    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      isVerified: user.isVerified,
    });
    
  } catch (error) {
    console.error("Error in login controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc Get auth user
// @route GET /api/auth/check
// @access Private
export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in checkAuth controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc Logout user
// @route POST /api/auth/logout
// @access Private
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc Update user profile
// @route PUT /api/auth/update-profile
// @access Private
export const updateProfile = async (req, res) => {
  try {
    console.log("update profile section");
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required." });
    }

    // Check if the Base64 string is valid by looking for the data URL prefix.
    if (!profilePic.startsWith("data:image/")) {
      return res.status(400).json({ message: "Invalid image format. Please upload a valid image." });
    }

    // Attempt to upload the Base64 image to Cloudinary.
    // If this fails, the catch block will handle the error.
    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    if (!uploadResponse.secure_url) {
      // Fallback in case Cloudinary upload succeeds but returns no URL.
      return res.status(500).json({ message: "Image upload failed. Please try again." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );
    
    // Return the updated user object wrapped in a key.
    res.status(200).json({ updatedUser });
  } catch (error) {
    console.log("Error in update profile:", error);
    // Provide a more user-friendly error message than a generic 500.
    res.status(500).json({ message: "Failed to update profile. Please try again later." });
  }
};


