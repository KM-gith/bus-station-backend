import mongoose from "mongoose";
import express from "express";
import Ticket from "../models/Ticket.js";
import Schedule from "../models/Schedule.js";
import User from "../models/User.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { sendTicketConfirmationEmail } from "../config/emailService.js";
import { initializePayment, verifyPayment } from "../config/chapaService.js";

const router = express.Router();

// Pending payments temporary store (memory)
const pendingPayments = new Map();

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

// POST — Payment initialize godhi
router.post("/initiate-payment", protect, async (req, res) => {
  const { scheduleId, seatNumber } = req.body;

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

    const existingSeat = await Ticket.findOne({ schedule: scheduleId, seatNumber, status: "booked" });
    if (existingSeat) return res.status(400).json({ message: "Seat already taken." });

    const duplicateTicket = await Ticket.findOne({ passenger: req.user.id, schedule: scheduleId, status: "booked" });
    if (duplicateTicket) return res.status(400).json({ message: "You already have a ticket for this schedule." });

    const passenger = await User.findById(req.user.id);
    const nameParts = passenger.name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts[1] || nameParts[0];

    // ✅ Short txRef — 50 chars hin caalu
    const shortTxRef = `BUS-${Date.now()}`.slice(0, 50);

    // ✅ Pending payment store — scheduleId fi seatNumber save godhi
    pendingPayments.set(shortTxRef, {
      userId: req.user.id,
      scheduleId,
      seatNumber: parseInt(seatNumber),
    });

    const chapaResponse = await initializePayment({
      amount: schedule.route.price,
      currency: "ETB",
      email: passenger.email,
      firstName,
      lastName,
      txRef: shortTxRef,
      callbackUrl: `${process.env.BACKEND_URL}/tickets/verify-payment`,
      returnUrl: `${process.env.FRONTEND_URL}/passenger?payment=success&txRef=${shortTxRef}`,
      description: `Bus ticket ${schedule.route.origin} to ${schedule.route.destination}`,
    });

    if (chapaResponse.status !== "success") {
      return res.status(400).json({ message: "Payment initialization failed." });
    }

    res.json({
      checkoutUrl: chapaResponse.data.checkout_url,
      txRef: shortTxRef,
    });

  } catch (err) {
    console.error("PAYMENT INIT ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET — Payment verify fi ticket uumi
router.get("/verify-payment", async (req, res) => {
  const { trx_ref } = req.query;

  if (!trx_ref) {
    return res.redirect(`${process.env.FRONTEND_URL}/passenger?payment=failed`);
  }

  try {
    const verifyResponse = await verifyPayment(trx_ref);

    if (verifyResponse.status !== "success" || verifyResponse.data?.status !== "success") {
      return res.redirect(`${process.env.FRONTEND_URL}/passenger?payment=failed`);
    }

    // Pending payment irraa info argadhu
    const pending = pendingPayments.get(trx_ref);
    if (!pending) {
      return res.redirect(`${process.env.FRONTEND_URL}/passenger?payment=failed`);
    }

    const { userId, scheduleId, seatNumber } = pending;

    // Duplicate check
    const existingTicket = await Ticket.findOne({ passenger: userId, schedule: scheduleId, status: "booked" });
    if (existingTicket) {
      pendingPayments.delete(trx_ref);
      return res.redirect(`${process.env.FRONTEND_URL}/passenger?payment=already_booked`);
    }

    const schedule = await Schedule.findById(scheduleId).populate("route").populate("bus");
    const passenger = await User.findById(userId);

    // Ticket uumi
    const ticket = await Ticket.create({
      passenger: userId,
      schedule: scheduleId,
      seatNumber,
      price: schedule.route.price,
    });

    await Schedule.updateOne({ _id: scheduleId }, { $inc: { availableSeats: -1 } });

    // Pending irraa haqii
    pendingPayments.delete(trx_ref);

    // Email ergi
    try {
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
          paymentMethod: "Chapa",
          accountNumber: passenger.email,
        });
      }
    } catch (emailErr) {
      console.error("Email error:", emailErr.message);
    }

    res.redirect(`${process.env.FRONTEND_URL}/passenger?payment=success`);

  } catch (err) {
    console.error("VERIFY ERROR:", err.message);
    res.redirect(`${process.env.FRONTEND_URL}/passenger?payment=failed`);
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
s