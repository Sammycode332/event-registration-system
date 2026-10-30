import type {Request,Response,NextFunction} from "express";

type UserRole = "user" |"organizer" | "admin"

export function authorizeRoles(...allowedRoles: UserRole[]){
    return(req:Request,res:Response,next:NextFunction)=>{
        const user = res.locals.user;

        if(!user){
            return res.status(401).json({
                error:"Authentication required"
            })
        }
        if(!allowedRoles.includes(user.role)){
            return res.status(403).json({
                error:"You do not have permission to perform this action"
            })
        }
        next()
    }
}