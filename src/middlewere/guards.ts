import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewere/auth";

export const onlyManagers = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "MANAGER")
    return res.status(403).json({ error: "Forbidden" });
  return next();
};
