
import { Router } from "express";
import { pool}from "../db.js";
import type { PoolClient } from "pg";

const router = Router();


router.post("/", async (req, res) => {
    if (
     typeof req.body !== "object" ||
     req.body === null ||
     Array.isArray(req.body)
   ) {
     return res.status(400).json({
       error: "Request body must be a valid object",
     });
    }
  const { user_id, event_id } = req.body;
  if (
    !Number.isInteger(user_id) ||
    user_id <= 0 ||
    !Number.isInteger(event_id) ||
    event_id <= 0
  ) {
    return res.status(400).json({
      error: "Valid user_id and event_id are required",
    });
  }

  let client: PoolClient | undefined;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const eventResult = await client.query(
      `SELECT capacity
       FROM events
       WHERE id = $1
       FOR UPDATE`,
      [event_id]
    );

    if (eventResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Event not found" });
    }

    const capacity = eventResult.rows[0].capacity;

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
          error: "Event is full",
        });
      }
    }

    const result = await client.query(
      `INSERT INTO registrations (user_id, event_id)
       VALUES ($1, $2)
       RETURNING *`,
      [user_id, event_id]
    );

    await client.query("COMMIT");

    return res.status(201).json(result.rows[0]);
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
        error: "User is already registered for this event",
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


router.get("/user/:userId", async (req, res) => {
  const userId = Number(req.params.userId);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({
      error: "Valid user ID is required",
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         r.id AS registration_id,
         r.user_id,
         e.id AS event_id,
         e.title,
         e.location,
         e.starts_at
       FROM registrations r
       INNER JOIN events e ON r.event_id = e.id
       WHERE r.user_id = $1
       ORDER BY e.starts_at ASC`,
      [userId]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Failed to fetch user registrations:", error);

    return res.status(500).json({
      error: "Failed to fetch user registrations",
    });
  }
});
router.delete("/:id", async (req, res) => {
  const registrationId = Number(req.params.id);
  if(!Number.isInteger(registrationId) || registrationId <=0){
    return res.status(400).json({
        error:"Valid registration ID is required"
    })
  }
  try{
    const result = await pool.query(
        `DELETE FROM registrations
        WHERE id = $1
        RETURNING *`,
        [registrationId]
    );
    if(result.rowCount === 0){
        return res.status(404).json({
            error: "Registration not found"
        });

    }
    return res.status(200).json({
        message: "Registration cancelled successfully",
        registration: result.rows[0]
    });
  }catch(error){
    console.error("Failed to cancel registration:",error)

    return res.status(500).json({
        error: "Failed to cancel registration"
    })
  }
})
export default router;
