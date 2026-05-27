import express from "express";

import cors from "cors";
import cookieParser from "cookie-parser"
import bcrypt from "bcryptjs"
import authRoutes from "./routes/auth"
import transactionRoutes from "./routes/transaction"

import * as dotenv from "dotenv";
dotenv.config()

const app = express();

const JWT_SECRET = process.env.JWT_SECRET
const PORT = process.env.PORT

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(cookieParser())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/transaction", transactionRoutes)

app.get("/", (req, res) => {
  res.send("Hello TypeScript");
});

app.listen(PORT, () => {
  console.log("http://localhost:" + PORT +"/")
  console.log(bcrypt.genSaltSync(12));
});