import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    passenger: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule", required: true },
    seatNumber: { type: Number, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ["booked", "cancelled", "used"], default: "booked" },
    ticketCode: {
      type: String,
      unique: true,
      default: () => "TKT-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    },
  },
  { timestamps: true }
);

// ← NO pre-save hook here

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;