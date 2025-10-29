import request from "supertest";
import app from "../../app";
import User from "../../db/models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { FIX } from "../helpers/fixtures";

jest.mock("../../db/models/user", () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
}));
jest.mock("bcrypt", () => ({ compare: jest.fn() }));
jest.mock("jsonwebtoken", () => ({ sign: jest.fn() }));

describe("POST /auth/login", () => {
  const path = "/auth/login";

  it("200 OK: valid credentials", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(FIX.user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("jwt-token");

    const res = await request(app).post(path).send(FIX.loginOkBody);

    expect(res.status).toBe(200);
    expect(res.body.jwtToken).toBe("jwt-token");
    expect(jwt.sign).toHaveBeenCalled();
  });

  it("401: user not found", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post(path).send({
      email: "x@test.com",
      password: "Wrong123!",
    });

    expect(res.status).toBe(401);
    expect(res.body.error?.code).toBe("USER_NOT_FOUND");
  });

  it("401: invalid credentials", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({ passwordHash: "hashed" });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const res = await request(app).post(path).send(FIX.loginBadBody);

    expect(res.status).toBe(401);
    expect(res.body.error?.code).toBe("INVALID_CREDENTIALS");
  });
});
