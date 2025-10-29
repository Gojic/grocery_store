import { AuthRequest } from "../middlewere/auth";
import { Response } from "express";
import {
  listUsersService,
  createUserService,
  updateUserService,
  deleteUserService,
} from "../services/usersService";
import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asynHandler";

export const getManagers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const baseNodeId = (req.query.nodeId as string) ?? req.user!.nodeId!;
    const withDesc = (req.query.withDesc as string) === "true";

    const users = await listUsersService({
      baseNodeId,
      withDesc,
      role: "MANAGER",
      accessNodeIds: req.accessNodeIds ?? [],
    });

    return res.status(200).json({ users });
  }
);

export const createUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const hashed = await bcrypt.hash(req.body.password, 10);
    const user = await createUserService({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      nodeName: req.body.nodeName,
      passwordHash: hashed,
    });
    return res.status(201).json({ user });
  }
);

export const editUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await updateUserService(req.params.id, req.body);
    return res.json({ user });
  }
);

export const deleteUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await deleteUserService(req.params.id);
    return res.json({ message: "User deleted successfully" });
  }
);
