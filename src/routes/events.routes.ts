import { Router } from "express";
import { pool } from "../db.js";
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
router.post("/",async(req,res)=>{
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
    try{
        const result = await pool.query(
            `INSERT INTO events(title,description,location,starts_at,capacity)
            VALUES($1,$2,$3,$4,$5)
            RETURNING *`,
            [cleanTitle,description??null,cleanLocation,starts_at,capacity ?? null]
        );
        return res.status(201).json(result.rows[0])
    }catch(error){
        console.error("Failed to create event:",error);
        return res.status(500).json({error: "Failed to create event"})
    }
    
    

})
export default router