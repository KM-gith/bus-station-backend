import mongoose from "mongoose";

const routeSchema = new mongoose.Schema(
  {
    origin: { type: String, required: true },       // fkn: "Finfinnee"
    destination: { type: String, required: true },  // fkn: "Adaamaa"
    distance: { type: Number, required: true },     // km
    duration: { type: Number, required: true },     // daqiiqaa
    price: { type: Number, required: true },        // ETB
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const Route = mongoose.model("Route", routeSchema);
export default Route;
