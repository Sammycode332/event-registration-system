import express from "express";
import healthRoutes from "./routes/health.routes.js";
import eventsRoutes from "./routes/events.routes.js"
const app = express();

app.use("/health", healthRoutes);
app.use("/events",eventsRoutes)

export default app;