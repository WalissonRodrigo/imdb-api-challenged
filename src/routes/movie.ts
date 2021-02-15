import { Router } from "express";
import MovieController from "../controllers/MovieController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";

const router = Router();

// Get all users
router.get("/", [checkJwt, checkRole(["ADMIN", "USER"])], MovieController.listAll);

// Get one user
router.get(
  "/:id([0-9]+)",
  [checkJwt, checkRole(["ADMIN", "USER"])],
  MovieController.getOneById
);

// Create a new user
router.post("/", [checkJwt, checkRole(["ADMIN"])], MovieController.newMovie);

// Edit one user
router.put(
  "/:id([0-9]+)",
  [checkJwt, checkRole(["ADMIN"])],
  MovieController.editMovie
);

// Edit one user
router.patch(
  "/:id([0-9]+)",
  [checkJwt, checkRole(["ADMIN"])],
  MovieController.editMovie
);

// Logically deletes a user
router.delete(
  "/:id([0-9]+)",
  [checkJwt, checkRole(["ADMIN"])],
  MovieController.deleteMovie
);

// Delete user by id forever
router.delete(
  "/:id([0-9]+)/forever",
  [checkJwt, checkRole(["ADMIN"])],
  MovieController.deleteMovieForever
);

// Recover a logically deleted user
router.post(
  "/:id([0-9]+)/recover",
  [checkJwt, checkRole(["ADMIN"])],
  MovieController.recover
);

// Rate on movie
router.post(
  "/rate",
  [checkJwt, checkRole(["ADMIN", "USER"])],
  MovieController.rate
);

export default router;
