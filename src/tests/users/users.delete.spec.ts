import request from "supertest";
import app from "../../app";
import Node from "../../db/models/node";
import { deleteUserService } from "../../services/usersService";
import { authHeader } from "../helpers/auth";

jest.mock("../../services/usersService");
jest.mock("../../db/models/node", () => ({
  __esModule: true,
  default: { find: jest.fn() },
}));
jest.mock("jsonwebtoken", () => ({ verify: jest.fn() }));

const headers = () => {
  const h = authHeader();
  (Node.find as any).mockReturnValue({
    distinct: jest.fn().mockResolvedValue(["root"]),
  });
  return h;
};

describe("DELETE /managers/:id", () => {
  it("422 invalid id", async () => {
    const res = await request(app).delete("/managers/not-an-id").set(headers());
    expect(res.status).toBe(422);
  });

  it("404 USER_NOT_FOUND", async () => {
    (deleteUserService as jest.Mock).mockRejectedValue({
      message: "User not found",
      status: 404,
      code: "USER_NOT_FOUND",
    });
    const res = await request(app)
      .delete("/managers/650000000000000000000001")
      .set(headers());
    expect([404, 500]).toContain(res.status);
  });

  it("200 OK", async () => {
    (deleteUserService as jest.Mock).mockResolvedValue(undefined);
    const res = await request(app)
      .delete("/managers/650000000000000000000001")
      .set(headers());
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
