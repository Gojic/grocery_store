/**
 * Custom application error class used to handle expected errors gracefully.
 * Extends the native JavaScript `Error` object with additional metadata
 * for standardized API responses.
 *
 * ### Features:
 * - Contains HTTP status code.
 * - Optional error code for machine-readable diagnostics.
 * - Optional `details` field for additional context (validation info, payloads, etc).
 *
 * ### Example:
 * ```ts
 * throw new AppError("User not found", 404, "USER_NOT_FOUND");
 * ```
 *
 * @class AppError
 * @extends Error
 *
 * @property {number} status - HTTP status code to send in response.
 * @property {string} [code] - Short string identifier for error type.
 * @property {unknown} [details] - Optional additional information for debugging or client display.
 *
 * @constructor
 * @param {string} message - Human-readable error message.
 * @param {number} status - HTTP status code.
 * @param {string} [code] - Optional internal error code.
 * @param {unknown} [details] - Optional extra diagnostic data.
 */

export class AppError extends Error {
  status: number;
  code?: string | undefined;
  details?: unknown | undefined;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
