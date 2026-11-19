import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import connectDB from "./config/db.js";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";

import jobRoutes from "./routes/jobRoutes.js";

import applicationRoutes from "./routes/applicationRoutes.js";

import companyRoutes from "./routes/companyRoutes.js";
import requestLogger from "./middleware/requestLogger.js";
import notFoundMiddleware from "./middleware/notFoundMiddleware.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL
}));

app.use(express.json());
app.use(requestLogger);
app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Job Portal Backend is running"
  });
});

app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/applications", applicationRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();