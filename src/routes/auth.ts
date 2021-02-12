import { Router } from "express";
import AuthController from "../controllers/AuthController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();
// Login route
router.post("/login", AuthController.login);

// Change my password
router.post("/change-password", [checkJwt], AuthController.changePassword);

// Register to users clients
router.post("/register", AuthController.register);

// Renew a refresh-token from user.
router.post("/refresh-token", AuthController.refreshToken);

export default router;
