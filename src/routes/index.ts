import { Router } from "express";
import auth from "./auth";
import user from "./user";

const routes = Router();
// response default to not return error on server.
routes.get("/", function (req, res) {
  return res.send("Welcome in the API IMDb Teste Backend");
});
routes.use("/auth", auth);
routes.use("/user", user);

export default routes;
