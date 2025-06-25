import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
  );
};

// REGISTER
export const register = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    // Validate mobile number
    if (!mobile || isNaN(mobile)) {
      return res.status(400).json({ message: "Mobile number must be a valid number" });
    }

    if (mobile.length < 10 || mobile.length > 10) {
      return res.status(400).json({ message: "Mobile number must be 10 digits" });
    }

    // Check if email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check if mobile already exists
    const existingUserByMobile = await User.findOne({ mobile });
    if (existingUserByMobile) {
      return res.status(400).json({ message: "Mobile number already registered" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({ mobile, email, password: hashedPassword, isActive: true });
    await user.save();

    // Generate Access Token
    const accessToken = generateAccessToken(user);

    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // Use generic message for security
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: "Account has been blocked. Please contact support." });
    }

    // Validate Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Use generic message for security
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update user's active status
    user.isActive = true;
    await user.save();

    // Generate Access Token
    const accessToken = generateAccessToken(user);

    // Send response with access token and user details
    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
        firstName: user.firstName,
        lastName: user.lastName
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "An error occurred during login", error: error.message });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find the user and update active status
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({ 
      success: true,
      message: "Logged out successfully" 
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error during logout", 
      error: error.message 
    });
  }
};

