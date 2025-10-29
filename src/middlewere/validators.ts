import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
/**
 * Middleware that validates request input using `express-validator`.
 *
 * Collects validation results from previous validation chains
 * and formats them into a standardized JSON error array if any
 * validation rules fail.
 *
 * ### Example output:
 * ```json
 * {
 *   "errors": [
 *     { "field": "email", "message": "Invalid email format" },
 *     { "field": "password", "message": "Password is required" }
 *   ]
 * }
 * ```
 *
 * @param {Request} req - Express request with potential validation errors.
 * @param {Response} res - Express response used to send formatted error list.
 * @param {NextFunction} next - Next middleware function.
 *
 * @returns {Response|void} Returns 422 JSON if validation fails, else calls `next()`.
 */

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result
      .formatWith((e: any) => ({
        field: e.path ?? e.param,
        message: String(e.msg),
      }))
      .array({ onlyFirstError: true });
    return res.status(422).json({ errors });
  }
  next();
};
