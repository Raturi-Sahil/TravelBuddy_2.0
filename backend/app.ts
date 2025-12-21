import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application } from "express";
import morgan from "morgan";

import connectToDB from "./db/db";
import errorMiddleware from "./middlewares/errorMiddleware";
import aiRoutes from "./routes/aiRoute";
import friendRoutes from "./routes/friendRoute";
import placesRoutes from "./routes/placesRoute";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import userRoutes from "./routes/userRoute";

const app: Application = express();

// Connect to MongoDB
connectToDB();

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// HTTP request logger - logs all route hits in dev
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/users", userRoutes);
app.use("/friends", friendRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/ai", aiRoutes);
app.use("/places", placesRoutes);

// Global Error Handler
app.use(errorMiddleware);

export default app;
