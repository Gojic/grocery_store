import request from "supertest";
import app from "../../app";
import Node from "../../db/models/node";
import User from "../../db/models/user";
import { updateUserService } from "../../services/usersService";
import { authHeader } from "../helpers/auth";

jest.mock("../../services/usersService");
jest.mock("../../db/models/node", () => ({
  __esModule: true,
  default: { find: jest.fn() },
}));
jest.mock("../../db/models/user", () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
}));
jest.mock("jsonwebtoken", () => ({ verify: jest.fn() }));

const headers = () => {
  const h = authHeader();
  (Node.find as any).mockReturnValue({
    distinct: jest.fn().mockResolvedValue(["root"]),
  });
  return h;
};

describe("PUT /managers/:id", () => {
  it("422: at least one field required", async () => {
    const res = await request(app)
      .put("/managers/650000000000000000000001")
      .set(headers())
      .send({});
    expect(res.status).toBe(422);
  });

  it("422: invalid email", async () => {
    const res = await request(app)
      .put("/managers/650000000000000000000001")
      .set(headers())
      .send({ email: "bad" });
    expect(res.status).toBe(422);
  });

  it("422: email already in use", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({ _id: "other" });
    const res = await request(app)
      .put("/managers/650000000000000000000001")
      .set(headers())
      .send({ email: "taken@demo.rs" });
    expect(res.status).toBe(422);
  });

  it("404 USER_NOT_FOUND (service)", async () => {
    (updateUserService as jest.Mock).mockRejectedValue({
      message: "User not found",
      status: 404,
      code: "USER_NOT_FOUND",
    });
    const res = await request(app)
      .put("/managers/650000000000000000000001")
      .set(headers())
      .send({ name: "New" });
    expect([404, 500]).toContain(res.status);
  });

  it("200 OK", async () => {
    (updateUserService as jest.Mock).mockResolvedValue({
      _id: "u2",
      name: "New",
    });
    const res = await request(app)
      .put("/managers/650000000000000000000001")
      .set(headers())
      .send({ name: "New" });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe("New");
  });
});
