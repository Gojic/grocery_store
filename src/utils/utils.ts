import Node from "../db/models/node";
import { Types } from "mongoose";
/**
 * Checks whether all target node IDs are within the user's allowed access scope.
 *
 * Used for ACL (Access Control List) enforcement in hierarchical data models.
 *
 * ### Example:
 * ```ts
 * const canAccess = ensureAllowed(
 *   ["671d1...", "671d2..."],  // user's allowed node IDs
 *   ["671d2...", "671d3..."]   // target nodes being requested
 * );
 * // returns false (user cannot access 671d3)
 * ```
 *
 * @function ensureAllowed
 * @param {string[] | undefined} access - List of accessible node IDs for current user.
 * @param {string[]} target - List of node IDs being accessed.
 *
 * @returns {boolean} True if all target IDs are accessible, otherwise false.
 */

export const ensureAllowed = (
  access: string[] | undefined,
  target: string[]
): boolean => {
  const allowed = new Set(access ?? []);
  return target.every((id) => allowed.has(id));
};

/**
 * Resolves a base node ID into a list of node IDs that should be included
 * in queries — optionally including all descendant nodes (based on hierarchy).
 *
 * Uses the `superiors` array (materialized path) to identify all child nodes.
 *
 * ### Example:
 * ```ts
 * // Suppose structure: Srbija > Beograd > Novi Beograd
 * const ids = await resolveNodeIds("beogradId", true);
 * // => ["beogradId", "noviBeogradId"]
 * ```
 *
 * @function resolveNodeIds
 * @async
 * @param {string} nodeId - The base node ID.
 * @param {boolean} withDesc - Whether to include descendant nodes.
 *
 * @returns {Promise<string[]>} List of node IDs (base + descendants if applicable).
 */

export const resolveNodeIds = async (nodeId: string, withDesc: boolean) => {
  const id = new Types.ObjectId(nodeId);
  if (!withDesc) return [String(id)];
  const ids = await Node.find({
    $or: [{ _id: id }, { superiors: id }],
  }).distinct("_id");
  return ids.map(String);
};
