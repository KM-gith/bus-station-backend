import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// POST /auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, role, adminCode } = req.body;
  try {
    // ✅ Admin secret code check
    if (role === "admin") {
      if (!adminCode || adminCode !== process.env.ADMIN_SECRET_CODE) {
        return res.status(403).json({ message: "Invalid admin code." });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "passenger",
    });
    res.status(201).json({ message: "Account created successfully." });
  } catch {
    res.status(500).json({ message: "Server error. Try again." });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, name: user.name, role: user.role });
  } catch {
    res.status(500).json({ message: "Server error. Try again." });
  }
});

export default router;
