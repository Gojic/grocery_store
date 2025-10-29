import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewere/auth";

/**
 * Middleware that restricts access to MANAGER-level users.
 *
 * Checks `req.user.role` and blocks access if it is not `"MANAGER"`.
 *
 * ### Behavior:
 * - If user role !== MANAGER → Responds with 403 Forbidden.
 * - Otherwise → Passes control to next middleware.
 *
 * @param {AuthRequest} req - Request object containing authenticated user.
 * @param {Response} res - Express response.
 * @param {NextFunction} next - Next middleware.
 *
 * @returns {Response|void} Returns 403 or calls `next()`.
 *
 * @example
 * router.post("/managers", auth, onlyManagers, createManager);
 */

export const onlyManagers = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "MANAGER")
    return res.status(403).json({ error: "Forbidden" });
  return next();
};
