import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application } from "express";
import morgan from "morgan";

import connectToDB from "./db/db";
import errorMiddleware from "./middlewares/errorMiddleware";
import activityRoutes from "./routes/activityRoutes";
import adminRoutes from "./routes/adminRoutes";
import aiRoutes from "./routes/aiRoute";
import articleRoutes from "./routes/articleRoutes";
import chatRoutes from "./routes/chatRoute";
import expenseRoutes from "./routes/expenseRoutes";
import friendRoutes from "./routes/friendRoute";
import groupChatRoutes from "./routes/groupChatRoutes";
import guideRoutes from "./routes/guideRoute";
import notificationRoutes from "./routes/notificationsRoutes";
import placesRoutes from "./routes/placesRoute";
import postRoutes from "./routes/postRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import transportRoutes from "./routes/transportRoute";
import userRoutes from "./routes/userRoute";


const app: Application = express();

// Connect to MongoDB
connectToDB();

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
      ].filter(Boolean) as string[];

      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") || // Allow Vercel deployments
        origin.endsWith(".onrender.com")  // Allow Render deployments
      ) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// HTTP request logger - logs all route hits in dev
if (process.env.NODE_ENV !== "PROD") {
  app.use(morgan("dev"));
}

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for Render
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/users", userRoutes);
app.use("/friends", friendRoutes);
app.use("/chat", chatRoutes);
app.use("/group-chats", groupChatRoutes);
app.use("/subscription", subscriptionRoutes);


app.use("/ai", aiRoutes);
app.use("/activities", activityRoutes);
app.use("/places", placesRoutes);
app.use("/posts", postRoutes);
app.use("/articles", articleRoutes);
app.use("/guides", guideRoutes);
app.use("/notifications", notificationRoutes);
app.use("/expenses", expenseRoutes);
app.use("/transports", transportRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("API IS RUNNING ");
});

// Global Error Handler
app.use(errorMiddleware);

export default app;

