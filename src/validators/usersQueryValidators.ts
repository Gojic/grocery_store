import { query } from "express-validator";
import mongoose from "mongoose";

export const listUsersQueryValidators = [
  query("nodeId")
    .optional({ nullable: true })
    .bail()
    .custom((v) => mongoose.Types.ObjectId.isValid(String(v)))
    .withMessage("nodeId must be a valid Mongo ObjectId"),

  query("withDesc")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("withDesc must be boolean")
    .toBoolean(),
];
