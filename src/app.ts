import express from "express";
import healthRoutes from "./routes/health.routes.js";
import eventsRoutes from "./routes/events.routes.js"
import registrationsRoutes from "./routes/registrations.routes.js";
const app = express();

app.use(express.json())
app.use("/health", healthRoutes);
app.use("/events",eventsRoutes)
app.use("/registrations", registrationsRoutes);

export default app;