import { Router } from "express";
import {
  getManagers,
  createUser,
  editUser,
  deleteUser,
} from "../controllers/managersController";
import { auth } from "../middlewere/auth";
import { onlyManagers } from "../middlewere/guards";
import { validate } from "../middlewere/validators";
import { updateUserValidators } from "../validators/editUserValidators";
import { createUserValidators } from "../validators/createUserValidators";
import { listUsersQueryValidators } from "../validators/usersQueryValidators";
import { deleteUserParamValidators } from "../validators/deleteUserValidators";
const router = Router();

router.get(
  "/",
  auth,
  onlyManagers,
  listUsersQueryValidators,
  validate,
  getManagers
);
router.post(
  "/",
  auth,
  onlyManagers,
  createUserValidators,
  validate,
  createUser
);
router.put(
  "/:id",
  auth,
  onlyManagers,
  updateUserValidators,
  validate,
  editUser
);
router.delete(
  "/:id",
  auth,
  onlyManagers,
  deleteUserParamValidators,
  validate,
  deleteUser
);
export default router;
