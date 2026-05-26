import { Pool } from 'pg';
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT), // สำคัญ: ต้องเป็น number
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on("connect", () => {
  console.log("Connect To the Database")
})

pool.on("error", (err : Error) => {
  console.log("Database Error", err)
})

export default pool;