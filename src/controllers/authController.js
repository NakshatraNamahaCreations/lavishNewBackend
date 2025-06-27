import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { sendOtpToMobile, generateOtp } from "../utils/otpService.js"; // your custom logic

dotenv.config();


const otpStore = {}; // Use Redis in production

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);
};

// REGISTER
export const register = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    // Validate mobile number
    if (!mobile || isNaN(mobile)) {
      return res
        .status(400)
        .json({ message: "Mobile number must be a valid number" });
    }

    if (mobile.length < 10 || mobile.length > 10) {
      return res
        .status(400)
        .json({ message: "Mobile number must be 10 digits" });
    }

    // Check if email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check if mobile already exists
    const existingUserByMobile = await User.findOne({ mobile });
    if (existingUserByMobile) {
      return res
        .status(400)
        .json({ message: "Mobile number already registered" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      mobile,
      email,
      password: hashedPassword,
      isActive: true,
    });
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
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // Use generic message for security
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res
        .status(403)
        .json({ message: "Account has been blocked. Please contact support." });
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
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "An error occurred during login",
      error: error.message,
    });
  }
};

// 1️⃣ Send OTP (Login or Signup)
// export const sendOtp = async (req, res) => {
//   const { mobile, email } = req.body;

//   if (!mobile || !/^\d{10}$/.test(mobile)) {
//     return res.status(400).json({ message: "Enter a valid 10-digit mobile number" });
//   }

//   try {
//     let user = await User.findOne({ mobile });

//     // New user, ask for email
//     if (!user && !email) {
//       return res.status(400).json({ message: "New number. Please provide email to continue" });
//     }

//     // If new user and email provided, create account
//     if (!user && email) {
//       const emailTaken = await User.findOne({ email });
//       if (emailTaken) {
//         return res.status(400).json({ message: "Email already in use with another number" });
//       }
//       user = new User({ mobile, email, isActive: true });
//       await user.save();
//     }

//     const otp = generateOtp();
//     otpStore[mobile] = otp;
//     setTimeout(() => delete otpStore[mobile], 10 * 60 * 1000); // Expires in 10 mins

//     await sendOtpToMobile(mobile, otp);

//     res.status(200).json({ message: "OTP sent successfully" });
//   } catch (err) {
//     console.error("Send OTP error:", err.message);
//     res.status(500).json({ message: "Failed to send OTP" });
//   }
// };

export const sendOtp = async (req, res) => {
  const { mobile, email } = req.body;
  console.log("➡️ Incoming request body:", req.body);

  if (!mobile || !/^\d{10}$/.test(mobile)) {
    console.log("❌ Invalid mobile number");
    return res.status(400).json({ message: "Enter a valid 10-digit mobile number" });
  }

  try {
    let user = await User.findOne({ mobile });
    console.log("🔍 User found by mobile:", user);

    if (!user) {
      if (!email) {
        console.log("❗ New number, email not provided");
        return res.status(400).json({ message: "New number. Please provide email to continue" });
      }

      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        console.log("❌ Email already taken by another user");
        return res.status(400).json({ message: "Email already in use with another number" });
      }

      user = new User({ mobile, email, isActive: true });
      await user.save();
      console.log("✅ New user created:", user);
    }

    const otp = generateOtp();
    console.log("🧾 Generated OTP:", otp);
    otpStore[mobile] = otp;
    setTimeout(() => delete otpStore[mobile], 10 * 60 * 1000);

    await sendOtpToMobile(mobile, otp);
    console.log("✅ OTP sent successfully");

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("🔥 Send OTP error:", err.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};



// 2️⃣ Verify OTP
export const verifyOtp = async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ message: "Mobile and OTP are required" });
  }

  if (otpStore[mobile] !== otp) {
    return res.status(401).json({ message: "Invalid or expired OTP" });
  }

  try {
    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: "User not found" });

    const accessToken = generateAccessToken(user);
    delete otpStore[mobile]; // Clear OTP after success

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error("Verify OTP error:", err.message);
    res.status(500).json({ message: "Something went wrong" });
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
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
      error: error.message,
    });
  }
};
