import "dotenv/config";
import { pool } from "../db.js";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile)
const migrationDirectory = path.resolve(
    currentDirectory,
    "../database/migrations"
)
async function getMigrationFiles(): Promise<string[]>{
    const files = await readdir(migrationDirectory)

    return files.filter((file)=>file.endsWith(".sql"))
    .sort();
}
async function createMigrationTable(): Promise<void>{
    await pool.query(
        `CREATE TABLE IF NOT EXISTS schema_migrations(
           id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
           migration_name VARCHAR(255) NOT NULL UNIQUE,
           applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`
    )
}
async function getAppliedMigrations(): Promise<Set<string>>{
    const result = await pool.query<{ migration_name: string }>(
        "SELECT migration_name FROM schema_migrations"
    );

    return new Set(result.rows.map((row)=> row.migration_name))
}
async function recordMigration(migrationName: string): Promise<void> {
    await pool.query(
        "INSERT INTO schema_migrations(migration_name) values ($1)",
        [migrationName]
    )
}
async function runMigrations(): Promise<void> {
  await createMigrationTable();

  const migrationFiles = await getMigrationFiles();
  const appliedMigrations = await getAppliedMigrations();

  for (const migrationFile of migrationFiles) {
    if (appliedMigrations.has(migrationFile)) {
      console.log(`Skipping ${migrationFile}; already applied.`);
      continue;
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      if (migrationFile === "001_create_events.sql") {
        const result = await client.query(
          "SELECT to_regclass('public.events') AS events_table"
        );

        if (result.rows[0]?.events_table) {
          console.log("Events table already exists; recording baseline.");
          await client.query(
            "INSERT INTO schema_migrations (migration_name) VALUES ($1)",
            [migrationFile]
          );
          await client.query("COMMIT");
          continue;
        }
      }

      const migrationPath = path.join(
        migrationDirectory,
        migrationFile
      );
      const sql = await readFile(migrationPath, "utf8");

      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (migration_name) VALUES ($1)",
        [migrationFile]
      );

      await client.query("COMMIT");
      console.log(`Applied ${migrationFile}`);
    } catch (error) {
    try{
        await client.query("ROLLBACK");
    }
      catch(rollbackError){
        console.error("Rollback failed: ",rollbackError)
      }
      throw error;
    } finally {
      client.release();
    }
  }
}

runMigrations()
  .catch((error: unknown) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });