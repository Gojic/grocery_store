import User from "../db/models/user";
import Node from "../db/models/node";
import { AppError } from "../utils/appError";
import { resolveNodeIds, ensureAllowed } from "../utils/utils";
export type Role = "EMPLOYEE" | "MANAGER";
export const listUsersService = async (opts: {
  baseNodeId: string;
  withDesc: boolean;
  role: Role;
  accessNodeIds: string[];
}) => {
  const targetNodeIds = await resolveNodeIds(opts.baseNodeId, opts.withDesc);

  if (!ensureAllowed(opts.accessNodeIds, targetNodeIds)) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }
  return User.find({ role: opts.role, nodeId: { $in: targetNodeIds } });
};

export const createUserService = async (input: {
  name: string;
  email: string;
  role: "EMPLOYEE" | "MANAGER";
  nodeName: string;
  passwordHash: string;
}) => {
  const node = await Node.findOne({ name: input.nodeName });

  if (!node) throw new AppError("Node not found", 404, "NODE_NOT_FOUND");
  const exists = await User.findOne({ email: input.email });
  if (exists) throw new AppError("Email already exists", 409, "EMAIL_EXISTS");
  return User.create({ ...input, nodeId: node._id });
};

export const updateUserService = async (
  id: string,
  patch: Partial<{
    name: string;
    email: string;
    role: "EMPLOYEE" | "MANAGER";
    nodeName: string;
  }>
) => {
  const user = await User.findById(id);
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  if (patch.nodeName) {
    const node = await Node.findOne({ name: patch.nodeName });
    if (!node) throw new AppError("Node not found", 404, "NODE_NOT_FOUND");
    user.nodeId = node._id;
  }
  if (patch.name) user.name = patch.name;
  if (patch.email) user.email = patch.email;
  if (patch.role) user.role = patch.role;
  await user.save();
  return user;
};

export const deleteUserService = async (id: string) => {
  const user = await User.findById(id);
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  await user.deleteOne();
};
