import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import CryptoJS from "crypto-js";
import { PrismaClient } from "@prisma/client";

const appSecret = process.env.JWT_SECRET;
const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: any;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const signature = req.headers.signature as string | undefined;
  const timestamp = req.headers.timestamp as string | undefined;

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized", error: "No token provided" });
  }

  if (!signature) {
    return res.status(403).json({ message: "Forbidden", error: "No signature provided" });
  }

  if (!timestamp) {
    return res.status(403).json({ message: "Forbidden", error: "No timestamp provided" });
  }

  if (timestamp && (Math.abs(Date.now() - parseInt(timestamp)) > 1 * 60 * 1000)) {
    return res.status(403).json({ message: "Forbidden", error: "Timestamp is too old" });
  }

  const check = CryptoJS.HmacSHA256(timestamp, process.env.SIGNATURE_SECRET!).toString(CryptoJS.enc.Hex);
  if (check !== signature) {
    return res.status(403).json({ message: "Forbidden", error: "Invalid signature" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Bad Format", error: "Invalid authorization format" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & { id: string, email: string, validAt: Date };
    req.user = decoded;

    const user = await prisma.users.findUnique({ where: { id: decoded.id } });
    
    if(user?.validAt == null) {
      return res.status(403).json({ message: "Forbidden", error: "Subscription ended contact owner" })
    } else {
      if(user.validAt < new Date()) {
        return res.status(403).json({ message: "Forbidden", error: "Subscription ended contact owner" })
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized", error: "Invalid or expired token" });
  }
}