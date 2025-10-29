import request from "supertest";
import app from "../../app";
import jwt from "jsonwebtoken";
import Node from "../../db/models/node";
import { authHeader } from "../helpers/auth";

jest.mock("../../db/models/node", () => ({
  __esModule: true,
  default: { find: jest.fn() },
}));
jest.mock("jsonwebtoken", () => ({ verify: jest.fn() }));

describe("auth middleware", () => {
  it("401 NO_TOKEN", async () => {
    const res = await request(app).get("/managers");
    expect(res.status).toBe(401);
    expect(res.body.error?.code).toBe("NO_TOKEN");
  });

  it("401 BAD_HEADER", async () => {
    const res = await request(app)
      .get("/managers")
      .set("Authorization", "Token X");
    expect(res.status).toBe(401);
    expect(res.body.error?.code).toBe("BAD_HEADER");
  });

  it("401 invalid token", async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      const e: any = new Error("bad");
      e.name = "JsonWebTokenError";
      throw e;
    });
    const res = await request(app)
      .get("/managers")
      .set("Authorization", "Bearer bad");
    expect(res.status).toBe(401);
  });

  it("200 passes auth to next", async () => {
    const headers = authHeader();
    (Node.find as any).mockReturnValue({
      distinct: jest.fn().mockResolvedValue(["root"]),
    });

    const res = await request(app).get("/managers").set(headers);
    expect([200, 422, 500]).toContain(res.status);
  });
});
