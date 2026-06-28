import mongoose from "mongoose";
import express from "express";
import Ticket from "../models/Ticket.js";
import Schedule from "../models/Schedule.js";
import User from "../models/User.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { sendTicketConfirmationEmail } from "../config/emailService.js";

const router = express.Router();

// GET my tickets — passenger
router.get("/my", protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({ passenger: req.user.id })
      .populate({
        path: "schedule",
        populate: [
          { path: "bus", select: "plateNumber busNumber busType" },
          { path: "route", select: "origin destination price" },
        ],
      });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all tickets — admin only
router.get("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("passenger", "name email")
      .populate({
        path: "schedule",
        populate: [
          { path: "bus", select: "plateNumber busNumber" },
          { path: "route", select: "origin destination" },
        ],
      });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST book ticket — passenger
router.post("/", protect, async (req, res) => {
  const { scheduleId, seatNumber, paymentMethod, accountNumber, amount } = req.body;

  if (!scheduleId || !seatNumber) {
    return res.status(400).json({ message: "scheduleId and seatNumber are required." });
  }

  if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
    return res.status(400).json({ message: "Invalid scheduleId." });
  }

  try {
    const schedule = await Schedule.findById(scheduleId).populate("route").populate("bus");
    if (!schedule) return res.status(404).json({ message: "Schedule not found." });
    if (schedule.availableSeats <= 0) return res.status(400).json({ message: "No seats available." });

    // Seat taken check
    const existingSeat = await Ticket.findOne({ schedule: scheduleId, seatNumber, status: "booked" });
    if (existingSeat) return res.status(400).json({ message: "Seat already taken." });

    // Duplicate passenger check
    const duplicateTicket = await Ticket.findOne({ passenger: req.user.id, schedule: scheduleId, status: "booked" });
    if (duplicateTicket) return res.status(400).json({ message: "You already have a ticket for this schedule." });

    // Amount check
    if (amount && parseFloat(amount) < schedule.route.price) {
      return res.status(400).json({ message: `Amount xiqqaa dha. ETB ${schedule.route.price} kaffaluu qabda.` });
    }

    // Ticket uumi
    const ticket = await Ticket.create({
      passenger: req.user.id,
      schedule: scheduleId,
      seatNumber,
      price: schedule.route.price,
    });

    // Available seats hir'isi
    await Schedule.updateOne({ _id: scheduleId }, { $inc: { availableSeats: -1 } });

    // ✅ Email ergi — payment details waliin
    try {
      const passenger = await User.findById(req.user.id);
      if (passenger?.email) {
        await sendTicketConfirmationEmail({
          to: passenger.email,
          passengerName: passenger.name,
          ticketCode: ticket.ticketCode,
          origin: schedule.route.origin,
          destination: schedule.route.destination,
          busNumber: schedule.bus.busNumber,
          busType: schedule.bus.busType,
          seatNumber,
          departureTime: schedule.departureTime,
          arrivalTime: schedule.arrivalTime,
          price: schedule.route.price,
          paymentMethod: paymentMethod || "N/A",
          accountNumber: accountNumber || "N/A",
          amountPaid: amount || schedule.route.price,
        });
      }
    } catch (emailErr) {
      console.error("Email error:", emailErr.message);
    }

    res.status(201).json(ticket);
  } catch (err) {
    console.error("TICKET ERROR:", err.name, err.message);
    res.status(500).json({ message: err.message });
  }
});

// PUT cancel ticket
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found." });
    if (ticket.passenger.toString() !== req.user.id)
      return res.status(403).json({ message: "Not your ticket." });

    ticket.status = "cancelled";
    await ticket.save();

    await Schedule.findByIdAndUpdate(ticket.schedule, { $inc: { availableSeats: 1 } });
    res.json({ message: "Ticket cancelled." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
