import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// @desc Middleware to protect routes and ensure only authenticated users can access them
// @access Private
export const protectRoute = async (req, res, next) => {
  try {
    // Get the JWT token from the cookies sent with the request
    const token = req.cookies.jwt;

    // Check if the token exists. If not, the user is unauthorized.
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    // Verify the token using the secret key from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If the token cannot be verified, it's invalid.
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // Find the user associated with the token's userId, excluding the password field
    const user = await User.findById(decoded.userId).select("-password");

    // If no user is found with that ID, the user account might have been deleted.
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach the user object to the request so it can be accessed by subsequent route handlers
    req.user = user;

    // Proceed to the next middleware or route handler in the chain
    next();
  } catch (error) {
    // Catch any errors during the token verification or database lookup
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};