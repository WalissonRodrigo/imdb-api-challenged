import { Router } from "express";
import auth from "./auth";
import user from "./user";
import movie from "./movie";

const routes = Router();

routes.use("/auth", auth);
routes.use("/user", user);
routes.use("/movie", movie);

export default routes;
