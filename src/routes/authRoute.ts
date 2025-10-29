import { Router } from "express";
import { login } from "../controllers/authController";
import { validate } from "../middlewere/validators";
import { loginValidators } from "../validators/authValidators";
const router = Router();

router.post("/login", loginValidators, validate, login);

export default router;
