import type {Request,Response,NextFunction} from "express";
import supabase from "../lib/supabase.js";
import { pool } from "../db.js";

export async function authenticate(req: Request,res:Response,next: NextFunction) {
    {
        try{
            const authHeader = req.headers.authorization
            if(!authHeader?.startsWith("Bearer ")){
                return res.status(401).json({
                    error: "Authentication required"
                })
            }
            const token = authHeader.split(" ")[1]

            if(!token){
                return res.status(401).json({
                    error:"Invalid autorisation header"
                });
            }
            const{data,error} = await supabase.auth.getUser(token)

            if (error || !data.user) {
    console.error("Supabase verification error:", {
        message: error?.message,
        status: error?.status,
        code: error?.code,
    });

    return res.status(401).json({
        error: "Invalid or expired token",
    });
}
            const result = await pool.query(
                 `SELECT id, auth_user_id, name, email, role
             FROM users
             WHERE auth_user_id = $1`,
            [data.user.id]
             );
            if(result.rows.length === 0){
                return res.status(401).json({
                    error: "User profile not found"
                })
            }
            res.locals.user = result.rows[0]
            next();

    } catch(error) {
        console.error("Authentication error:",error)

        return res.status(500).json({
            error: "Authentication failed"
        })
    }
}
}