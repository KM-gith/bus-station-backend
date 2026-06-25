import express from "express";
import Schedule from "../models/Schedule.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all schedules — everyone
router.get("/", protect, async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("bus", "plateNumber busNumber totalSeats busType")
      .populate("route", "origin destination price duration");
    res.json(schedules);
  } catch {
    res.status(500).json({ message: "Server error." });
  }
});

// GET schedules by route — passenger search
router.get("/search", protect, async (req, res) => {
  const { origin, destination, date } = req.query;
  try {
    const schedules = await Schedule.find({ status: "scheduled" })
      .populate({
        path: "route",
        match: { origin, destination },
      })
      .populate("bus", "plateNumber busNumber totalSeats busType");

    const filtered = schedules.filter((s) => s.route !== null);
    res.json(filtered);
  } catch {
    res.status(500).json({ message: "Server error." });
  }
});

// POST create schedule — admin only
router.post("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const schedule = await Schedule.create(req.body);
    res.status(201).json(schedule);
  } catch {
    res.status(500).json({ message: "Server error." });
  }
});
// PUT update schedule — admin fi driver
router.put("/:id", protect, authorizeRoles("admin", "driver"), async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(schedule);
  } catch {
    res.status(500).json({ message: "Server error." });
  }
});

// DELETE schedule — admin only
router.delete("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: "Schedule deleted." });
  } catch {
    res.status(500).json({ message: "Server error." });
  }
});

export default router;

