import express from "express";
import Bus from "../models/Bus.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all buses — admin & driver
router.get("/", protect, async (req, res) => {
  try {
    const buses = await Bus.find().populate("driver", "name email");
    res.json(buses);
  } catch {
    res.status(500).json({ message: "Server error." });
  }
});

// POST create bus — admin only
router.post("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json(bus);
  } catch {
    res.status(500).json({ message: "Server error." });
  }
});

// PUT update bus — admin only
router.put("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(bus);
  } catch {
    res.status(500).json({ message: "Server error." });
  }
});

// DELETE bus — admin only
router.delete("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    await Bus.findByIdAndDelete(req.params.id);
    res.json({ message: "Bus deleted." });
  } catch {
    res.status(500).json({ message: "Server error." });
  }
});

export default router;
