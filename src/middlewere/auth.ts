import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import Node from "../db/models/node";
import { asyncHandler } from "../utils/asynHandler";
import { AppError } from "../utils/appError";
export interface AuthRequest extends Request {
  user?: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    nodeId?: string;
  };
  accessNodeIds?: string[];
}
export const auth = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      throw new AppError("Not authenticated (no token).", 401, "NO_TOKEN");
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new AppError("Bad Authorization header format.", 401, "BAD_HEADER");
    }
    const token = parts[1];
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError(
        "JWT secret is not defined on server.",
        500,
        "MISSING_JWT_SECRET"
      );
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      email: string;
      userName: string;
      role: "EMPLOYEE" | "MANAGER";
      nodeId: string;
    };
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.userName,
      role: decoded.role,
      nodeId: decoded.nodeId,
    };
    const ids = await Node.find({
      $or: [{ _id: decoded.nodeId }, { superiors: decoded.nodeId }],
    }).distinct("_id");
    req.accessNodeIds = ids.map(String);
    next();
  }
);
