import { Router } from "express";
import supabase from "../lib/supabase.js"

const router = Router()

router.post("/register", async(req, res)=>{
    try{
        const {name,email,password } = req.body
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                error: "Name, email and password are required",
            });
        }
        if (password.length < 8) {
            return res.status(400).json({
                error: "Password must be at least 8 characters long",
            });
        }
        const { data, error } = await supabase.auth.signUp({
         email:email.trim(),
          password,
          options: {
              data: {
                  name: name.trim(),
              },
          },
         });
   if(error){
    return res.status(400).json({
        error:error.message
    })
   }
    return res.status(201).json({
        message: data.session? "Registration successful": "Registration successfull. Please verify your email",
        user: data.user,
        requiresEmailVerification: !data.session,
    })
    }
    catch(error){
        console.error("Registration error:,error");

        return res.status(500).json({
            error: "An unexpected error occurred during registration"
        })
    }
    
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body ?? {};

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                error: "Email and password are required",
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        if (error || !data.session) {
            
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }

        return res.status(200).json({
            message: "Login successful",
            user: data.user,
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            error: "An unexpected error occurred during login",
        });
    }
});

export default router;

