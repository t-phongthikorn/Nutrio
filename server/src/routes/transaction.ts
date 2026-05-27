import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const router = express.Router();

console.log("Auth routes loaded");

import dotenv from "dotenv";
import supabase from "../api/supabaseClient";
dotenv.config();

router.post("/insert", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  let decoded: string | JwtPayload;

  try {
    decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    );
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    return res.status(401).json({ message: "Invalid token" });
  }

  if (typeof decoded === "string") {
    return res.status(401).json({ message: "Invalid token payload" });
  }

  const userId = decoded.user_id;

  if (req.body) {
    const payload = req.body.map((item: any) => ({
      ...item,
      user_id: userId,
    }));

    const { data: result, error } = await supabase
      .from("transactions")
      .insert(payload);

    if (error) {
      console.error(error);
      return res.status(500).json({
        message: "บันทึกล้มเหลว",
        error: error.message,
      });
    }

    return res.status(201).json({
      message: "บันทึกสำเร็จ",
      data: result,
    });
  }

  return res.status(400).json({
    message: "ไม่มีข้อมูล",
  });
});

export default router;
