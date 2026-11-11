import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import registrationsRoutes from "./routes/registrations.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { authenticate } from "./middleware/authenticate.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      const isLocalDevelopment = /^http:\/\/localhost:[0-9]+$/.test(origin);
      if (isLocalDevelopment || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

app.use("/health", healthRoutes);
app.use("/events", eventsRoutes);
app.use("/registrations", registrationsRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

app.get("/auth/me", authenticate, (_req, res) => {
  return res.status(200).json({
    message: "Authenticated successfully",
    user: res.locals.user,
  });
});

export default app;
