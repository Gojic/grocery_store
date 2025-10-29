import { body } from "express-validator";

export const loginValidators = [
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email is required")
    .isString()
    .withMessage("Email must be a string")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Invalid email")
    .bail(),
  body("password")
    .exists({ checkFalsy: true })
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];
