import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import busRoutes from "./routes/busRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://bus-station-frontend-three.vercel.app"
  ],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/buses", busRoutes);
app.use("/routes", routeRoutes);
app.use("/schedules", scheduleRoutes);
app.use("/tickets", ticketRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
