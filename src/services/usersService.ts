import User from "../db/models/user";
import Node from "../db/models/node";
import { AppError } from "../utils/appError";
import { resolveNodeIds, ensureAllowed } from "../utils/utils";
export type Role = "EMPLOYEE" | "MANAGER";

/**
 * Retrieves a list of users (employees or managers) from a given node
 * and optionally all its descendant nodes.
 *
 * @function listUsersService
 * @async
 * @param {Object} opts - Query options.
 * @param {string} opts.baseNodeId - The starting node ID for the query.
 * @param {boolean} opts.withDesc - Whether to include all descendant nodes.
 * @param {"EMPLOYEE" | "MANAGER"} opts.role - Role to filter users by.
 * @param {string[]} opts.accessNodeIds - IDs of nodes the requesting user can access (ACL enforcement).
 *
 * @throws {AppError} 403 - If user tries to access nodes outside of allowed scope.
 *
 * @returns {Promise<User[]>} List of matching users.
 *
 * @example
 * await listUsersService({
 *   baseNodeId: "671dfb12a9...",
 *   withDesc: true,
 *   role: "EMPLOYEE",
 *   accessNodeIds: ["671dfb12a9...", "671dfc67bb..."]
 * });
 */

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

/**
 * Creates a new user (EMPLOYEE or MANAGER) within a specific node.
 *
 * @function createUserService
 * @async
 * @param {Object} input - User creation data.
 * @param {string} input.name - User’s full name.
 * @param {string} input.email - Unique email address.
 * @param {"EMPLOYEE" | "MANAGER"} input.role - Assigned role.
 * @param {string} input.nodeName - The name of the node (branch/office) the user belongs to.
 * @param {string} input.passwordHash - Hashed password (bcrypt).
 *
 * @throws {AppError} 404 - If the target node does not exist.
 * @throws {AppError} 409 - If the email already exists.
 *
 * @returns {Promise<User>} The created user document.
 *
 * @example
 * await createUserService({
 *   name: "John Smith",
 *   email: "john.smith@company.rs",
 *   role: "MANAGER",
 *   nodeName: "Novi Sad",
 *   passwordHash: "<bcrypt-hash>"
 * });
 */


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

/**
 * Updates user data (name, email, role, or node).
 *
 * @function updateUserService
 * @async
 * @param {string} id - ID of the user to update.
 * @param {Object} patch - Fields to update (partial).
 * @param {string} [patch.name] - New name.
 * @param {string} [patch.email] - New email.
 * @param {"EMPLOYEE" | "MANAGER"} [patch.role] - New role.
 * @param {string} [patch.nodeName] - New node name (reassigns user to another node).
 *
 * @throws {AppError} 404 - If user or node not found.
 *
 * @returns {Promise<User>} The updated user document.
 *
 * @example
 * await updateUserService("671dfb12a9...", {
 *   name: "Updated Name",
 *   nodeName: "Beograd",
 * });
 */


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

/**
 * Deletes a user from the system by their ID.
 *
 * @function deleteUserService
 * @async
 * @param {string} id - ID of the user to delete.
 *
 * @throws {AppError} 404 - If user not found.
 *
 * @returns {Promise<void>} Nothing if successful.
 *
 * @example
 * await deleteUserService("671dfb12a9...");
 */

export const deleteUserService = async (id: string) => {
  const user = await User.findById(id);
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  await user.deleteOne();
};
