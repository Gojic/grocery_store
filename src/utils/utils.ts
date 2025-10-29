import Node from "../db/models/node";
import { Types } from "mongoose";

export const ensureAllowed = (
  access: string[] | undefined,
  target: string[]
): boolean => {
  const allowed = new Set(access ?? []);
  return target.every((id) => allowed.has(id));
};
export const resolveNodeIds = async (nodeId: string, withDesc: boolean) => {
  const id = new Types.ObjectId(nodeId);
  if (!withDesc) return [String(id)];
  const ids = await Node.find({
    $or: [{ _id: id }, { superiors: id }],
  }).distinct("_id");
  return ids.map(String);
};
