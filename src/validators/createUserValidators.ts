import { body } from "express-validator";
import User from "../db/models/user";
import Node from "../db/models/node";
export const createUserValidators = [
  body("name")
    .exists({ checkFalsy: true })
    .withMessage("User name is required")
    .isString()
    .withMessage("User name must be a string")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("User name must be between 2 and 100 characters"),

  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email is required")
    .isString()
    .withMessage("Email must be a string")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Invalid email")
    .bail()
    .custom(async (email) => {
      const exists = await User.exists({ email });
      if (exists) throw new Error("Email is already in use");
      return true;
    }),

  body("password")
    .exists({ checkFalsy: true })
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain a digit"),

  body("role")
    .exists({ checkFalsy: true })
    .withMessage("Role is required")
    .isIn(["EMPLOYEE", "MANAGER"])
    .withMessage("Role must be EMPLOYEE or MANAGER"),

  body("nodeName")
    .exists({ checkFalsy: true })
    .withMessage("nodeName is required")
    .isString()
    .withMessage("nodeName must be a string")
    .trim()
    .custom(async (nodeName) => {
      const node = await Node.findOne({ name: nodeName });
      if (!node) throw new Error("Node not found");
      return true;
    }),
];
