import { param } from "express-validator";
import mongoose from "mongoose";

export const deleteUserParamValidators = [
  param("id")
    .exists({ checkFalsy: true })
    .withMessage("id is required")
    .bail()
    .custom((v) => mongoose.Types.ObjectId.isValid(String(v)))
    .withMessage("id must be a valid Mongo ObjectId"),
];
