import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import Node from "../db/models/node";
import { asyncHandler } from "../utils/asynHandler";
import { AppError } from "../utils/appError";

/**
 * Express middleware that authenticates incoming requests via JWT Bearer token.
 *
 * ### Process:
 * 1. Reads `Authorization` header in the format: `Bearer <token>`.
 * 2. Validates header structure and presence.
 * 3. Verifies token using `JWT_SECRET` from environment variables.
 * 4. Decodes user information and attaches it to `req.user`.
 * 5. Queries all accessible node IDs (`nodeId` + descendant nodes)
 *    and attaches them to `req.accessNodeIds` for ACL enforcement.
 *
 * ### Error cases:
 * - 401 `NO_TOKEN` → Missing `Authorization` header.
 * - 401 `BAD_HEADER` → Invalid Bearer format.
 * - 401 `JsonWebTokenError` → Invalid or expired token.
 * - 500 `MISSING_JWT_SECRET` → Environment variable not set.
 *
 * ### Example header:
 * ```
 * Authorization: Bearer <JWT_TOKEN>
 * ```
 *
 * @param {AuthRequest} req - Extended Express Request containing optional `user` and `accessNodeIds`.
 * @param {Response} res - Express Response object.
 * @param {NextFunction} next - Next middleware callback.
 *
 * @throws {AppError} For missing token, invalid header, or missing JWT secret.
 *
 * @returns {void} Calls `next()` on successful authentication.
 */

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
