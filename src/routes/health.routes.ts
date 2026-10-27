import { Router } from "express"
import { pool } from "../db.js"
const router = Router();

router.get("/",(_req,res)=>{
    res.json({status:"ok"})
});
router.get("/db",async(_req,res)=>{
    try{
        await pool.query("SELECT 1");
        res.json({status:"ok",database:"connected"})
    }catch(error){
        console.error("Database connection failed: ",error)
        res.json(500).json({status:"error",databse:"disconnected"})
    }
})
export default router;