import { Router } from "express";
import supabase from "../lib/supabase.js";
import { authenticate } from "../middleware/authenticate.js";
import { supabaseUrl, supabaseKey } from "../lib/supabase.js";

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
              emailRedirectTo: "http://localhost:5173/login?verified=true",
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
        console.error("Registration error:",error);

        return res.status(500).json({
            error: "An unexpected error occurred during registration"
        })
    }
    
});
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: {
        emailRedirectTo: "http://localhost:5173/login?verified=true",
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      message: "If verification is required, a new email has been sent.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return res.status(500).json({
      error: "Unable to resend verification email",
    });
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

router.post("/refresh", async (req, res) => {
    try {
        const { refresh_token } = req.body ?? {};

        if (
            typeof refresh_token !== "string" ||
            !refresh_token.trim()
        ) {
            return res.status(400).json({
                error: "Refresh token is required",
            });
        }

        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refresh_token.trim(),
        });

        if (error || !data.session) {
            return res.status(401).json({
                error: "Invalid or expired refresh token",
            });
        }

        return res.status(200).json({
            message: "Session refreshed successfully",
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
        });

    } catch (error) {
        console.error("Token refresh error:", error);

        return res.status(500).json({
            error: "Unable to refresh session",
        });
    }
});
router.post("/logout", authenticate, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                error: "Authentication required"
            });
        }

        const response = await fetch(
            `${supabaseUrl}/auth/v1/logout?scope=global`,
            {
                method: "POST",
                headers: {
                    apikey: supabaseKey!,
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            console.error("Supabase logout failed:", response.status);

            return res.status(502).json({
                error: "Unable to complete logout"
            });
        }

        return res.status(200).json({
            message: "Successfully logged out"
        });

    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            error: "Logout failed"
        });
    }
});
export default router;

