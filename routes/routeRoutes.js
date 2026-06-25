import express from "express";
import Route from "../models/Route.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all routes — everyone
router.get("/", protect, async (req, res) => {
  try {
    const routes = await Route.find({ status: "active" });
    res.json(routes);
  } catch {
    res.status(500).json({ message: "Server error." });
  }
});

// POST create route — admin only
router.post("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json(route);
  } catch {
    res.status(500).json({ message: "Server error." });
  }
});

// PUT update route — admin only
router.put("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(route);
  } catch {
    res.status(500).json({ message: "Server error." });
  }
});

// DELETE route — admin only
router.delete("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    await Route.findByIdAndDelete(req.params.id);
    res.json({ message: "Route deleted." });
  } catch {
    res.status(500).json({ message: "Server error." });
  }
});

export default router;
