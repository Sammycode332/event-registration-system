import { Pool } from "pg";

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10,
});

pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL pool error:", error);
});