/**
 * Wraps asynchronous route handlers and automatically forwards errors to Express middleware.
 *
 * Prevents the need for repetitive try/catch blocks in controllers.
 * Any rejected Promise or thrown error is caught and passed to `next()`.
 *
 * ### Example:
 * ```ts
 * router.get("/users", asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 * ```
 *
 * @function asyncHandler
 * @param {(req: Request, res: Response, next: NextFunction) => Promise<any>} fn
 * The async function (controller or middleware) to wrap.
 *
 * @returns {RequestHandler} Express middleware function with automatic error forwarding.
 */

import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler =
  (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
