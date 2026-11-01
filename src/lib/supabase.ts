import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = process.env.SUPABASE_URL;
export const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;