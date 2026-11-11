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
router.get("/stats", authenticate, authorizeRoles("admin"), async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM users) AS total_users,
        (SELECT COUNT(*)::int FROM events) AS total_events,
        (SELECT COUNT(*)::int FROM registrations) AS total_registrations,
        (SELECT COUNT(*)::int FROM events WHERE starts_at >= NOW()) AS upcoming_events,
        (SELECT COUNT(*)::int FROM users WHERE role = 'user') AS total_attendees,
        (SELECT COUNT(*)::int FROM users WHERE role = 'organizer') AS total_organizers,
        (SELECT COUNT(*)::int FROM users WHERE role = 'admin') AS total_admins
    `);

    return res.status(200).json({
      stats: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to fetch admin statistics:", error);

    return res.status(500).json({
      error: "Failed to retrieve admin statistics",
    });
  }
});
router.get(
  "/upcoming-events",
  authenticate,
  authorizeRoles("admin"),
  async (_req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          e.id,
          e.title,
          e.location,
          e.starts_at,
          e.capacity,
          COUNT(r.id)::int AS registration_count
        FROM events e
        LEFT JOIN registrations r
          ON r.event_id = e.id
        WHERE e.starts_at >= NOW()
        GROUP BY e.id
        ORDER BY e.starts_at ASC
        LIMIT 5
      `);

      return res.status(200).json({
        events: result.rows,
      });
    } catch (error) {
      console.error("Failed to fetch upcoming events:", error);
      return res.status(500).json({
        error: "Failed to retrieve upcoming events",
      });
    }
  }
);
export default router;