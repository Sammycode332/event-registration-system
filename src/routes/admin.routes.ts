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
router.patch("/users/:id/role", authenticate,authorizeRoles("admin"),async(req,res)=>{
    try{

    
    const {role} = req.body;
    const allowedRoles = ["user","organizer","admin"]

    if(typeof role !== "string" || !allowedRoles.includes(role)){
        return res.status(400).json({
            error:"Invalid role"
        })
    }
    const targetUserId = req.params.id;
    const currentUserId = res.locals.user.id;

     if (typeof targetUserId !== "string" || !/^[1-9]\d*$/.test(targetUserId)) {
    return res.status(400).json({
        error: "Invalid user ID"
    });
   }

   if (targetUserId === String(currentUserId)) {
    return res.status(400).json({
        error: "You cannot change your own role"
    });
    }
    
    const existingUser = await pool.query(
    `SELECT id, name, email, role
     FROM users
     WHERE id = $1`,
    [targetUserId]
    );

   if (existingUser.rows.length === 0) {
       return res.status(404).json({
           error: "User not found",
       });
   }
   const result = await pool.query(
    `UPDATE users
     SET role = $1
     WHERE id = $2
     RETURNING id, name, email, role`,
    [role, targetUserId]
    );
    
    return res.status(200).json({
        message: "User role updated successfully",
        user: result.rows[0],
    });

}catch(error){
    console.error("Failed to update user role:", error)

    return res.status(500).json({
        error:"Failed to update user role"
    })
}
})

export default router;