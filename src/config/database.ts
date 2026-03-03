import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Test the database connection and run initial migration if tables don't exist.
 */
async function connectDB(): Promise<void> {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log(`✅ Database connected successfully at ${result.rows[0].now}`);

    // Check if tables exist, if not run initial migration
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log("📦 Running initial migration...");
      const migrationPath = path.resolve(
        __dirname,
        "../migrations/001_initial.sql"
      );
      const migrationSQL = fs.readFileSync(migrationPath, "utf-8");
      await client.query(migrationSQL);
      console.log("Initial migration completed successfully");
    } else {
      console.log("Database tables already exist, skipping migration");
    }

    client.release();
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

export { pool, connectDB };
