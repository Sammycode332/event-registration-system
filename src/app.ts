import express from "express";
import healthRoutes from "./routes/health.routes.js";
import eventsRoutes from "./routes/events.routes.js"
import registrationsRoutes from "./routes/registrations.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { authenticate } from "./middleware/authenticate.js";
const app = express();

app.use(express.json())
app.use("/health", healthRoutes);
app.use("/events",eventsRoutes)
app.use("/registrations", registrationsRoutes);
app.use("/auth",authRoutes)
app.use("/admin", adminRoutes);

app.get("/auth/me", authenticate, (req, res) => {
    return res.status(200).json({
        message: "Authenticated successfully",
        user: res.locals.user,
    });
});
export default app;