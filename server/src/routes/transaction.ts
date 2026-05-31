import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const router = express.Router();

console.log("Auth routes loaded");

import dotenv from "dotenv";
import supabase from "../api/supabaseClient";
import { authenticateToken, AuthRequest } from "../api/middleware";
import { deleteTransaction, editTransactions, insertTransactions } from "../services/transaction_service";
dotenv.config();

router.post("/insert", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.user_id;
    
    console.log(req.body)
    if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        message: "Body ไม่มีข้อมูล",
      });
    }

    const isValid = req.body.every(
      (item) =>
        item.amount !== undefined &&
        item.type &&
        item.time
    );

    if (!isValid) {
      return res.status(400).json({
        message: "Invalid transaction format",
      });
    }

    const result = await insertTransactions(req.body, userId);

    return res.status(201).json({
      message: "บันทึกสำเร็จ",
      data: result,
    });
  } catch (err: any) {
    console.error("Insert error:", err);

    return res.status(500).json({
      message: "บันทึกล้มเหลว",
      error: err.message,
    });
  }
});

router.post("/edit", authenticateToken, async (req: AuthRequest, res) => {
  console.log(req)
  try {
    const userId = req.user!.user_id;

    if (!req.body || req.body.length === 0) {
      return res.status(400).json({
        message: "Body ไม่มีข้อมูล",
      });
    }


    const result = await editTransactions(req.body, userId);

    return res.status(200).json({
      message: "แก้ไขสำเร็จ",
      data: result,
    });
  } catch (err: any) {
    console.error("Edit error:", err);

    return res.status(500).json({
      message: "แก้ไขล้มเหลว",
      error: err.message,
    });
  }
});

router.post("/delete", authenticateToken, async (req: AuthRequest, res) => {
  console.log(req)
  try {
    const userId = req.user!.user_id;

    const { transaction_id } = req.body;

    if (!transaction_id) {
      return res.status(400).json({
        message: "transaction_id is required",
      });
    }

    const result = await deleteTransaction(transaction_id, userId);

    return res.status(200).json({
      message: "ลบสำเร็จ",
      data: result,
    });
  } catch (err: any) {
    console.error("Delete error:", err);

    return res.status(500).json({
      message: "ลบล้มเหลว",
      error: err.message,
    });
  }
});

router.get("/get_transaction", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.user_id;

    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        message: "start and end are required",
      });
    }

    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    endDate.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .gte("time", startDate.toISOString())
      .lte("time", endDate.toISOString())
      .order("time", { ascending: true });

    if (error) {
      console.error(error);
      return res.status(500).json({
        message: "ดึงข้อมูลล้มเหลว",
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "success",
      data,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      message: "server error",
    });
  }
});

export default router;
