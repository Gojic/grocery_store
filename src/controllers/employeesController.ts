import { Response } from "express";
import { AuthRequest } from "../middlewere/auth";

import { listUsersService } from "../services/usersService";
import { asyncHandler } from "../utils/asynHandler";

export const getEmployees = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const baseNodeId = (req.query.nodeId as string) ?? req.user!.nodeId!;
    const withDesc = (req.query.withDesc as string) === "true";

    const users = await listUsersService({
      baseNodeId,
      withDesc,
      role: "EMPLOYEE",
      accessNodeIds: req.accessNodeIds ?? [],
    });

    return res.status(200).json({ users });
  }
);
