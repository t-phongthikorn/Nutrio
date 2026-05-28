import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: { user_id: string };
}

export const authenticateToken = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
    console.log("Trap in middle ware")
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token  = authHeader.split(" ")[1] as string;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (!decoded || typeof decoded === "string" || !decoded.user_id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = { user_id: decoded.user_id };
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};