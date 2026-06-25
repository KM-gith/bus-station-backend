import mongoose from "mongoose";

const busSchema = new mongoose.Schema(
  {
    plateNumber: { type: String, required: true, unique: true },
    busNumber: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    busType: { type: String, enum: ["standard", "vip", "minibus"], default: "standard" },
    status: { type: String, enum: ["active", "maintenance", "inactive"], default: "active" },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const Bus = mongoose.model("Bus", busSchema);
export default Bus;
