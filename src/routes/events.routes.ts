import { Router } from "express";
import { pool } from "../db.js";
const router = Router()

router.get("/",async(_req,res) => {
    try{
        const result = await pool.query(
            "SELECT * FROM events ORDER BY starts_at ASC"
        );
        res.json(result.rows)

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
    return res.json(event)
    }catch(error){
        console.error("Failed to get event",error)
        return res.status(500).json({error:"Event does not exist"})
    }
  
})
export default router