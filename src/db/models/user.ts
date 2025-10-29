import type { Document } from "mongoose";
import { Schema, model, Types } from "mongoose";
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: "EMPLOYEE" | "MANAGER";
  passwordHash: string;
  nodeId: Types.ObjectId;
}
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    role: { type: String, required: true, enum: ["EMPLOYEE", "MANAGER"] },
    passwordHash: { type: String, required: true },
    nodeId: {
      type: Schema.Types.ObjectId,
      ref: "Node",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default model<IUser>("User", UserSchema);
