import User from "../models/user.model.js";
import Otp from "../models/otp.model.js";
import bcryptjs from "bcryptjs";
import {generateToken}   from "../lib/utils.js";
import  {sendOtpEmail } from "../lib/sendemail.js";

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

    // Check if an unverified OTP record exists and delete it
    await Otp.deleteOne({ email });

    // Save temporary user data and OTP in the Otp collection
    const newOtpRecord = new Otp({
      fullName,
      email,
      password: hashedPassword,
      otp,
    });
    
    await newOtpRecord.save();
    
    // Send OTP to user's email
    await sendOtpEmail(email, otp);

    res.status(201).json({ 
      message: "User registered successfully. Please verify your email with the OTP sent to your inbox."
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
    
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    
    // Check if OTP matches and is not expired
    if (otpRecord.otp !== otp || otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP ! SignUp Again" });
    }
    
    // If OTP is valid, create the permanent user record
    const user = new User({
      fullName: otpRecord.fullName,
      email: otpRecord.email,
      password: otpRecord.password,
      isVerified: true,
    });
    
    await user.save();
    
    // Generate token and set cookie
    generateToken(user._id, res);
    
    // Clean up OTP record
    await Otp.deleteOne({ email });
    
    res.status(200).json({ 
      message: "Email verified successfully!",
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      isVerified: user.isVerified,
    });
    
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
      await Otp.deleteOne({ email });
      await Otp.create({
        fullName: user.fullName,
        email: user.email,
        password: user.password,
        otp,
      });
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
    const { fullName, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update user data
    user.fullName = fullName || user.fullName;
    
    // Check if a new email is provided and handle verification
    if (email && email !== user.email) {
      user.isVerified = false;
      user.email = email;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await Otp.deleteOne({ email });
      await Otp.create({
        fullName: user.fullName,
        email: user.email,
        password: user.password,
        otp,
      });
      await sendOtpEmail(email, otp);
    }
    
    await user.save();
    
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      isVerified: user.isVerified,
    });
    
  } catch (error) {
    console.error("Error in updateProfile controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
