import { Router } from "express";
import { pool } from "../db.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
const router = Router()

router.get("/",async(_req,res) => {
    try{
        const result = await pool.query(
            "SELECT * FROM events ORDER BY starts_at ASC"
        );
        res.status(200).json(result.rows)

    }catch(error){
        console.error("Failed to fetch events:",error)
        res.status(500).json({error: "Failed to fetch events"})
    }
});
router.get("/:id", async(req,res)=>{
     const eventId = Number(req.params.id);
     if(!Number.isInteger(eventId)||eventId<=0){
        return res.status(400).json({error: "Invalid event ID"})
     }
    try{
    const result = await pool.query('SELECT * FROM events WHERE id = $1',[eventId])
    const event = result.rows[0]
    if(!event){
        return res.status(404).json({error:"Event not Found"})
    }
    return res.status(200).json(event)
    }catch(error){
        console.error("Failed to get event",error)
        return res.status(500).json({error:"Failed to retrieve event"})
    }
  
})
router.post("/",authenticate,authorizeRoles("organizer","admin"),async(req,res)=>{
    if(typeof req.body !== "object" || 
        req.body === null || 
        Array.isArray(req.body)
    ){
        return res.status(400).json({
            error:"Request body must be a valid object"
        });
    }
    const{title,description,location,starts_at,capacity} = req.body;
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof location !== "string" ||
      !location.trim() ||
      typeof starts_at !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(starts_at) ||
Number.isNaN(Date.parse(starts_at))||
      (description !== undefined &&
        description !== null &&
        typeof description !== "string") ||
      (capacity !== undefined &&
        capacity !== null &&
        (!Number.isInteger(capacity) || capacity <= 0))
    ) {
      return res.status(400).json({ error: "Invalid event data" });
    }
    const cleanTitle = title.trim()
    const cleanLocation = location.trim()
    const createdBy = res.locals.user.id;
    try{
        const result = await pool.query(
            `INSERT INTO events(title,description,location,starts_at,capacity,created_by)
            VALUES($1,$2,$3,$4,$5,$6)
            RETURNING *`,
            [cleanTitle,description??null,cleanLocation,starts_at,capacity ?? null,createdBy]
        );
        return res.status(201).json(result.rows[0])
    }catch(error){
        console.error("Failed to create event:",error);
        return res.status(500).json({error: "Failed to create event"})
    }

})
router.patch(
    "/:id",
    authenticate,
    authorizeRoles("organizer", "admin"),
    async (req, res) => {
        const eventId = req.params.id;

        // 1. Validate event ID
        if (
            typeof eventId !== "string" ||
            !/^[1-9]\d*$/.test(eventId)
        ) {
            return res.status(400).json({
                error: "Invalid event ID"
            });
        }

        try {
            // 2. Retrieve event
            const existingEvent = await pool.query(
                `SELECT id, created_by
                 FROM events
                 WHERE id = $1`,
                [eventId]
            );

            if (existingEvent.rows.length === 0) {
                return res.status(404).json({
                    error: "Event not found"
                });
            }

            // 3. Check ownership
            const event = existingEvent.rows[0];
            const currentUser = res.locals.user;

            if (
                currentUser.role !== "admin" &&
                String(event.created_by) !== String(currentUser.id)
            ) {
                return res.status(403).json({
                    error: "You can only modify events you created"
                });
            }

            // 4. Validate request body
            if (
                typeof req.body !== "object" ||
                req.body === null ||
                Array.isArray(req.body)
            ) {
                return res.status(400).json({
                    error: "Request body must be a valid object"
                });
            }

            // 5. Check allowed fields
            const allowedFields = [
                "title",
                "description",
                "location",
                "starts_at",
                "capacity"
            ];

            const submittedFields = Object.keys(req.body);

            if (
                submittedFields.length === 0 ||
                submittedFields.some(field => !allowedFields.includes(field))
            ) {
                return res.status(400).json({
                    error: "Invalid or missing update fields"
                });
            }

            // 6. Validate individual field values
            const {
                title,
                description,
                location,
                starts_at,
                capacity
            } = req.body;

            if (
                (title !== undefined &&
                    (typeof title !== "string" || !title.trim())) ||

                (description !== undefined &&
                    description !== null &&
                    typeof description !== "string") ||

                (location !== undefined &&
                    (typeof location !== "string" || !location.trim())) ||

                (starts_at !== undefined &&
                    (
                        typeof starts_at !== "string" ||
                        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(starts_at) ||
                        Number.isNaN(Date.parse(starts_at))
                    )) ||

                (capacity !== undefined &&
                    capacity !== null &&
                    (!Number.isInteger(capacity) || capacity <= 0))
            ) {
                return res.status(400).json({
                    error: "Invalid event data"
                });
            }

            // 7. Build dynamic SQL
            const updates: string[] = [];
            const values: unknown[] = [];

            for (const field of submittedFields) {
                updates.push(`${field} = $${values.length + 1}`);

                let value = req.body[field];

                if (typeof value === "string") {
                    value = value.trim();
                }

                values.push(value);
            }

            // 8. Add event ID to SQL parameters
            values.push(eventId);

            // 9. Execute update
            const result = await pool.query(
                `UPDATE events
                 SET ${updates.join(", ")}
                 WHERE id = $${values.length}
                 RETURNING *`,
                values
            );

            return res.status(200).json({
                message: "Event updated successfully",
                event: result.rows[0]
            });

        } catch (error) {
            console.error("Failed to update event:", error);

            return res.status(500).json({
                error: "Failed to update event"
            });
        }
    }
);
router.delete("/:id",authenticate,authorizeRoles("organizer","admin"),async(req,res)=>{
     const eventId = req.params.id;

        // 1. Validate event ID
        if (
            typeof eventId !== "string" ||
            !/^[1-9]\d*$/.test(eventId)
        ) {
            return res.status(400).json({
                error: "Invalid event ID"
            });
        }
        try{
            const existingEvent = await pool.query(
                `SELECT id, created_by
                 FROM events
                 WHERE id = $1`,
                [eventId]
            );

            if (existingEvent.rows.length === 0) {
                return res.status(404).json({
                    error: "Event not found"
                });
            }

            // 3. Check ownership
            const event = existingEvent.rows[0];
            const currentUser = res.locals.user;

            if (
                currentUser.role !== "admin" &&
                String(event.created_by) !== String(currentUser.id)
            ) {
                return res.status(403).json({
                    error: "You can only modify events you created"
                });
            }
            const result = await pool.query(
                `DELETE FROM events
                WHERE id = $1
                RETURNING id,title`,
                [eventId]
            );
            return res.status(200).json({
                message: "Event deleted successfully",
                event: result.rows[0]
            })

        }catch(error){
            console.error("Failed to delete event:",error)

            return res.status(500).json({
                error: "Failed to delete event"
            })
        }
})
export default router