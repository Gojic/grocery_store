import jwt from "jsonwebtoken";

export const authHeader = (
  payload: any = {
    userId: "u1",
    email: "a@a",
    userName: "A",
    role: "MANAGER",
    nodeId: "root",
  }
) => {
  (jwt.verify as jest.Mock).mockReturnValue(payload);
  return { Authorization: "Bearer ok" };
};
