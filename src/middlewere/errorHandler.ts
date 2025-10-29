import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import mongoose from "mongoose";

const parseDupKey = (err: any) => {
  const fields = Object.keys(err.keyPattern ?? {});
  const values = err.keyValue ?? {};
  return {
    fields,
    values,
    message:
      fields.length > 0
        ? `Duplicate value for ${fields.join(", ")}`
        : "Duplicate key",
  };
};

/**
 * Global error-handling middleware for Express.
 * Converts different error types into standardized JSON responses.
 *
 * ### Handles:
 * - `AppError` → Custom application errors (safe for clients).
 * - `mongoose.Error.ValidationError` → Schema validation issues.
 * - `mongoose.Error.CastError` → Invalid ObjectId or data type.
 * - `MongoServerError` (code 11000) → Duplicate key violations.
 * - JWT errors → Invalid or expired tokens.
 * - Fallback → Internal server errors (500).
 *
 * @example
 * return res.status(422).json({
 *   error: {
 *     message: "Validation failed",
 *     code: "DB_VALIDATION",
 *     details: [...]
 *   }
 * });
 *
 * @param {any} err - Error object thrown in middleware or route handlers.
 * @param {Request} _req - Express Request (unused).
 * @param {Response} res - Express Response.
 * @param {NextFunction} _next - Express next callback (unused).
 *
 * @returns {Response} JSON error response with structured details.
 */

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(422).json({
      error: {
        message: "Validation failed",
        code: "DB_VALIDATION",
        details: Object.values(err.errors).map((e: any) => e.message),
      },
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      error: {
        message: `Invalid value for '${err.path}'`,
        code: "CAST_ERROR",
        details: { path: err.path, value: err.value },
      },
    });
  }

  if (err?.name === "MongoServerError" && err?.code === 11000) {
    const info = parseDupKey(err);
    return res.status(409).json({
      error: {
        message: info.message,
        code: "UNIQUE_CONSTRAINT",
        details: { fields: info.fields, values: info.values },
      },
    });
  }
  if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    return res
      .status(401)
      .json({ error: { message: "Invalid or expired token", code: err.name } });
  }

  const isProd = process.env.NODE_ENV === "production";
  return res.status(500).json({
    error: {
      message: "Internal server error",
      code: "INTERNAL",
      ...(isProd
        ? {}
        : { debug: { message: err?.message, stack: err?.stack } }),
    },
  });
};
