import { Router } from "express";
import UserController from "../controllers/UserController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";

const router = Router();

// Get all users
router.get("/", [checkJwt, checkRole(["ADMIN"])], UserController.listAll);

// Get one user
router.get(
  "/:id([0-9]+)",
  [checkJwt, checkRole(["ADMIN"])],
  UserController.getOneById
);

// Create a new user
router.post("/", [checkJwt, checkRole(["ADMIN"])], UserController.newUser);

// Edit one user
router.put(
  "/:id([0-9]+)",
  [checkJwt, checkRole(["ADMIN"])],
  UserController.editUser
);

// Edit one user
router.patch(
  "/:id([0-9]+)",
  [checkJwt, checkRole(["ADMIN"])],
  UserController.editUser
);

// Logically deletes a user
router.delete(
  "/:id([0-9]+)",
  [checkJwt, checkRole(["ADMIN"])],
  UserController.deleteUser
);

// Delete user by id forever
router.delete(
  "/:id([0-9]+)/forever",
  [checkJwt, checkRole(["ADMIN"])],
  UserController.deleteUserForever
);

// Recover a logically deleted user
router.post(
  "/:id([0-9]+)/recover",
  [checkJwt, checkRole(["ADMIN"])],
  UserController.recover
);

export default router;
