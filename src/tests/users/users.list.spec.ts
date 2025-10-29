import request from "supertest";
import app from "../../app";
import Node from "../../db/models/node";
import { listUsersService } from "../../services/usersService";
import { authHeader } from "../helpers/auth";

jest.mock("../../services/usersService");
jest.mock("../../db/models/node", () => ({
  __esModule: true,
  default: { find: jest.fn() },
}));
jest.mock("jsonwebtoken", () => ({ verify: jest.fn() }));

const headers = () => {
  const h = authHeader({
    userId: "u1",
    email: "a@a",
    userName: "A",
    role: "MANAGER",
    nodeId: "root",
  });
  (Node.find as any).mockReturnValue({
    distinct: jest.fn().mockResolvedValue(["root", "child"]),
  });
  return h;
};

describe("GET /managers", () => {
  it("422 invalid query (nodeId)", async () => {
    const res = await request(app)
      .get("/managers?nodeId=BAD_ID&withDesc=false")
      .set(headers());
    expect(res.status).toBe(422);
  });

  it("403/500 FORBIDDEN bubble", async () => {
    (listUsersService as jest.Mock).mockRejectedValue(new Error("FORBIDDEN"));
    const res = await request(app)
      .get("/managers?nodeId=650000000000000000000001&withDesc=false")
      .set(headers());
    expect([403, 500]).toContain(res.status);
  });

  it("200 OK", async () => {
    (listUsersService as jest.Mock).mockResolvedValue([
      { _id: "u2", email: "m@demo.rs" },
    ]);
    const res = await request(app)
      .get("/managers?nodeId=650000000000000000000001&withDesc=true")
      .set(headers());
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(1);
  });
});
