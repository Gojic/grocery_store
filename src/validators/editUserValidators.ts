import { body, oneOf, param } from "express-validator";
import type { Request } from "express";
import User from "../db/models/user";
import Node from "../db/models/node";

const ROLES = ["EMPLOYEE", "MANAGER"] as const;

export const updateUserValidators = [
  param("id")
    .exists({ checkFalsy: true })
    .withMessage("id is required")
    .isString()
    .withMessage("id must be a string")
    .isMongoId()
    .withMessage("id must be a valid Mongo ObjectId"),

  oneOf(
    [
      body("name").exists({ checkFalsy: true }),
      body("email").exists({ checkFalsy: true }),
      body("role").exists({ checkFalsy: true }),
      body("nodeName").exists({ checkFalsy: true }),
    ],
    { message: "Provide at least one field to update" }
  ),

  body("name")
    .optional({ nullable: false })
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .optional({ nullable: false })
    .isString()
    .withMessage("Email must be a string")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Invalid email")
    .bail()
    .custom(async (email, { req }) => {
      const id = (req as Request).params?.id as string | undefined;
      const exists = await User.findOne({
        email,
        ...(id ? { _id: { $ne: id } } : {}),
      });
      if (exists) throw new Error("Email already in use");
      return true;
    }),

  body("role")
    .optional({ nullable: false })
    .isIn(ROLES)
    .withMessage("Role must be EMPLOYEE or MANAGER"),

  body("nodeName")
    .optional({ nullable: false })
    .isString()
    .withMessage("nodeName must be a string")
    .trim()
    .custom(async (nodeName) => {
      const node = await Node.findOne({ name: nodeName });
      if (!node) throw new Error("Node not found");
      return true;
    }),
];
