import { Schema, model, Types, Document } from "mongoose";
export type NodeKind = "OFFICE" | "STORE";

export interface INode extends Document {
  _id: Types.ObjectId;
  name: string;
  nodeType: NodeKind;
  parentId: Types.ObjectId | null;
  superiors: Types.ObjectId[];
}
const NodeSchema = new Schema<INode>(
  {
    name: { type: String, required: true },
    nodeType: { type: String, required: true, enum: ["OFFICE", "STORE"] },
    parentId: { type: Types.ObjectId, ref: "Node", default: null },
    superiors: [{ type: Types.ObjectId, ref: "Node", index: true }],
  },
  { timestamps: true }
);
NodeSchema.index({ name: 1, parentId: 1 }, { unique: true });
const Node = model<INode>("Node", NodeSchema);
export default Node;
