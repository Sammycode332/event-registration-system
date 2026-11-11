import { Router } from "express";
import { pool } from "../db.js";
import type { PoolClient } from "pg";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

// POST /registrations - register current user for event
router.post("/", authenticate, async (req, res) => {
    if (
        typeof req.body !== "object" ||
        req.body === null ||
        Array.isArray(req.body)
    ) {
        return res.status(400).json({
            error: "Request body must be a valid object",
        });
    }

    const { event_id } = req.body;

    if (!Number.isInteger(event_id) || event_id <= 0) {
        return res.status(400).json({
            error: "A valid event_id is required",
        });
    }

    let client: PoolClient | undefined;

    try {
        client = await pool.connect();
        await client.query("BEGIN");

        const eventResult = await client.query(
            `SELECT id, capacity, starts_at
             FROM events
             WHERE id = $1
             FOR UPDATE`,
            [event_id]
        );

        if (eventResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Event not found" });
        }

        const event = eventResult.rows[0];

        // Check if event has already occurred
        if (new Date(event.starts_at).getTime() < Date.now()) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "Cannot register for an event that has already passed" });
        }

        const capacity = event.capacity;

        if (capacity !== null) {
            const countResult = await client.query(
                `SELECT COUNT(*)::int AS total
                 FROM registrations
                 WHERE event_id = $1`,
                [event_id]
            );

            if (countResult.rows[0].total >= capacity) {
                await client.query("ROLLBACK");
                return res.status(409).json({
                    error: "Event is full. No spots available.",
                });
            }
        }

        const result = await client.query(
            `INSERT INTO registrations (user_id, event_id)
             VALUES ($1, $2)
             RETURNING *`,
            [res.locals.user.id, event_id]
        );

        await client.query("COMMIT");

        return res.status(201).json({
            message: "Successfully registered for event!",
            registration: result.rows[0],
        });
    } catch (error) {
        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Failed to rollback transaction:", rollbackError);
            }
        }

        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23505"
        ) {
            return res.status(409).json({
                error: "You are already registered for this event",
            });
        }

        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23503"
        ) {
            return res.status(404).json({
                error: "User or event not found",
            });
        }

        console.error("Failed to create registration:", error);
        return res.status(500).json({
            error: "Failed to create registration",
        });
    } finally {
        client?.release();
    }
});

// GET /registrations/me - get all registrations for the current user
router.get("/me", authenticate, async (_req, res) => {
    try {
        const result = await pool.query(
            `SELECT
               r.id AS registration_id,
               r.created_at AS registered_at,
               r.user_id,
               e.id AS event_id,
               e.title,
               e.description,
               e.location,
               e.starts_at,
               e.capacity,
               e.image_url,
               e.category
             FROM registrations r
             INNER JOIN events e ON r.event_id = e.id
             WHERE r.user_id = $1
             ORDER BY e.starts_at ASC`,
            [res.locals.user.id]
        );

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("Failed to fetch user registrations:", error);
        return res.status(500).json({
            error: "Failed to fetch user registrations",
        });
    }
});

// GET /registrations/check/:eventId - check if current user is registered for event
router.get("/check/:eventId", authenticate, async (req, res) => {
    const eventId = Number(req.params.eventId);
    if (!Number.isInteger(eventId) || eventId <= 0) {
        return res.status(400).json({ error: "Valid event ID is required" });
    }

    try {
        const result = await pool.query(
            `SELECT id, created_at
             FROM registrations
             WHERE event_id = $1 AND user_id = $2`,
            [eventId, res.locals.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(200).json({ isRegistered: false, registration: null });
        }

        return res.status(200).json({
            isRegistered: true,
            registration: result.rows[0],
        });
    } catch (error) {
        console.error("Failed to check registration status:", error);
        return res.status(500).json({ error: "Failed to check registration status" });
    }
});

// GET /registrations/event/:eventId - get attendee list for an event (organizer or admin)
router.get("/event/:eventId", authenticate, async (req, res) => {
    const eventId = Number(req.params.eventId);
    if (!Number.isInteger(eventId) || eventId <= 0) {
        return res.status(400).json({ error: "Valid event ID is required" });
    }

    try {
        const eventResult = await pool.query(
            `SELECT id, title, created_by FROM events WHERE id = $1`,
            [eventId]
        );

        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: "Event not found" });
        }

        const event = eventResult.rows[0];
        const currentUser = res.locals.user;

        if (currentUser.role !== "admin" && String(event.created_by) !== String(currentUser.id)) {
            return res.status(403).json({ error: "You can only view attendees for events you created" });
        }

        const attendees = await pool.query(
            `SELECT
               r.id AS registration_id,
               r.created_at AS registered_at,
               u.id AS user_id,
               u.name,
               u.email
             FROM registrations r
             INNER JOIN users u ON r.user_id = u.id
             WHERE r.event_id = $1
             ORDER BY r.created_at ASC`,
            [eventId]
        );

        return res.status(200).json({
            event_id: eventId,
            event_title: event.title,
            attendees: attendees.rows,
        });
    } catch (error) {
        console.error("Failed to fetch event attendees:", error);
        return res.status(500).json({ error: "Failed to fetch event attendees" });
    }
});

// DELETE /registrations/:id - cancel registration
router.delete("/:id", authenticate, async (req, res) => {
    const registrationId = Number(req.params.id);

    if (!Number.isInteger(registrationId) || registrationId <= 0) {
        return res.status(400).json({
            error: "Valid registration ID is required",
        });
    }

    try {
        const result = await pool.query(
            `DELETE FROM registrations
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [registrationId, res.locals.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: "Registration not found or unauthorized",
            });
        }

        return res.status(200).json({
            message: "Registration cancelled successfully",
            registration: result.rows[0],
        });
    } catch (error) {
        console.error("Failed to cancel registration:", error);
        return res.status(500).json({
            error: "Failed to cancel registration",
        });
    }
});

export default router;
