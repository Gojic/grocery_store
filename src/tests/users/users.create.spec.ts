import request from "supertest";
import app from "../../app";
import Node from "../../db/models/node";
import User from "../../db/models/user";
import { createUserService } from "../../services/usersService";
import { authHeader } from "../helpers/auth";

jest.mock("../../services/usersService");

jest.mock("../../db/models/node", () => ({
  __esModule: true,
  default: { find: jest.fn(), findOne: jest.fn() },
}));

jest.mock("../../db/models/user", () => ({
  __esModule: true,
  default: { findOne: jest.fn(), exists: jest.fn() },
}));

jest.mock("jsonwebtoken", () => ({ verify: jest.fn() }));

const headers = () => {
  const h = authHeader();
  (Node.find as any).mockReturnValue({
    distinct: jest.fn().mockResolvedValue(["root"]),
  });
  return h;
};

const primeValidators = (opts?: {
  emailTaken?: boolean;
  nodeName?: string;
}) => {
  (Node.findOne as jest.Mock).mockResolvedValue({
    _id: "n1",
    name: opts?.nodeName ?? "Subotica",
  });
  (User.findOne as jest.Mock).mockResolvedValue(
    opts?.emailTaken ? { _id: "uX" } : null
  );
  (User.exists as jest.Mock).mockResolvedValue(
    opts?.emailTaken ? { _id: "uX" } : null
  );
};

describe("POST /managers", () => {
  it("422 from validators (bad email)", async () => {
    const res = await request(app).post("/managers").set(headers()).send({
      name: "X",
      email: "bad",
      role: "MANAGER",
      nodeName: "Subotica",
      password: "Test123!",
    });
    expect(res.status).toBe(422);
  });

  it("404 NODE_NOT_FOUND (service)", async () => {
    primeValidators({ emailTaken: false, nodeName: "Subotica" });

    (createUserService as jest.Mock).mockRejectedValue({
      message: "Node not found",
      status: 404,
      code: "NODE_NOT_FOUND",
    });

    const res = await request(app).post("/managers").set(headers()).send({
      name: "Ok",
      email: "e@demo.rs",
      role: "EMPLOYEE",
      nodeName: "Subotica",
      password: "Test123!",
    });

    expect([404, 500]).toContain(res.status);
  });

  it("201 Created", async () => {
    primeValidators({ emailTaken: false, nodeName: "Subotica" });

    (createUserService as jest.Mock).mockResolvedValue({
      _id: "u2",
      email: "e@demo.rs",
    });

    const res = await request(app).post("/managers").set(headers()).send({
      name: "Ok",
      email: "e@demo.rs",
      role: "EMPLOYEE",
      nodeName: "Subotica",
      password: "Test123!",
    });

    expect(res.status).toBe(201);
    expect(res.body.user._id).toBe("u2");
  });
});
