import { Router } from "express";
import { getEmployees } from "../controllers/employeesController";
import { auth } from "../middlewere/auth";
import { listUsersQueryValidators } from "../validators/usersQueryValidators";
import { validate } from "../middlewere/validators";
const router = Router();

router.get("/", auth, listUsersQueryValidators, validate, getEmployees);

export default router;
