
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check required fields
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    // 2. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email"
      });
    }

    // 4. Validate password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters"
      });
    }

    // 5. Validate role
    const allowedRoles = ["jobSeeker", "employer"];
    const userRole = role || "jobSeeker";

    if (!allowedRoles.includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role"
      });
    }

    // 6. Check whether email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered"
      });
    }

    // 7. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 8. Create user in MongoDB
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole
    });

    // 9. Send response without password
    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    // Handle duplicate email race conditions
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered"
      });
    }

    next(error);
  }
};



export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate required fields
    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // 2. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Find user in MongoDB
    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // 4. Compare submitted password with stored hash
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // 5. Generate JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
      }
    );

    // 6. Send token and safe user details
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    next(error);
  }
};

