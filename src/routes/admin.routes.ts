import { Router } from "express";
import { pool } from "../db.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
const router = Router();

router.get("/users",authenticate,authorizeRoles("admin"),async(_req,res)=>{
    try{
       const result = await pool.query(
            `SELECT id, name, email, role, created_at
             FROM users
             ORDER BY created_at DESC`
        );
        return res.status(200).json({
            users:result.rows,
        });
    }catch(error){
        console.error("Failed to fetch users:",error)
        return res.status(500).json({
            error: "Failed to retrieve users"
        })
    }
})
export default router;