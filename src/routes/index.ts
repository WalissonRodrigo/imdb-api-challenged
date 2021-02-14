import { Router } from "express";
import auth from "./auth";
import user from "./user";
import movie from './movie';

const routes = Router();
// response default to not return error on server.
routes.get("/", [], function (req, res) {
  return res.status(200).send("Welcome in the API IMDb Teste Backend");
});
routes.use("/auth", auth);
routes.use("/user", user);
routes.use("/movie", movie);

export default routes;
