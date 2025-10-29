import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../db/models/user";
import { asyncHandler } from "../utils/asynHandler";
import { AppError } from "../utils/appError";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) {
    throw new AppError("User not found", 401, "USER_NOT_FOUND");
  }

  const isEqual = await bcrypt.compare(password, user.passwordHash);
  if (!isEqual) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }
  const jwtSecret = process.env.JWT_SECRET!;
  const jwtToken = jwt.sign(
    {
      userName: user.name,
      email: user.email,
      userId: user._id.toString(),
      role: user.role,
      nodeId: user.nodeId.toString(),
    },
    jwtSecret,
    { expiresIn: "1h" }
  );
  return res.status(200).json({
    message: "Logged in",
    jwtToken,
    user: {
      id: user._id.toString(),
      email: user.email,
      userName: user.name,
      role: user.role,
      nodeId: user.nodeId.toString(),
    },
  });
});
