import dotenv from "dotenv";
import pkg from "pg";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool(
  process.env.NODE_ENV === "production"
    ? {
        connectionString: process.env.DATABASE_PUBLIC_URL,
        ssl: {
          rejectUnauthorized: false,
        },
        max: 1, // for Vercel functions
        min: 0,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        allowExitOnIdle: true,
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
      }
);
  pool.on('error', (err) => {
     console.error('Database pool error:', err);
    }
  );

export default pool;
