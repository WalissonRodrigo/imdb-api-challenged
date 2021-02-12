import "reflect-metadata";
import { createConnection } from "typeorm";
import * as dotenv from 'dotenv';
import * as express from "express";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import routes from "./routes";

import swaggerJSDoc = require("swagger-jsdoc");
import swaggerUI = require("swagger-ui-express");

import { swaggerDocument, swaggerOptions } from "../swagger.config";
dotenv.config();
//Connects to the Database -> then starts the express
createConnection()
  .then(async () => {
    // Create a new express application instance
    const app = express();

    // Call midlewares
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());
    const swaggerDocs = swaggerJSDoc(swaggerDocument);
    app.use(
      "/api-docs",
      swaggerUI.serve,
      swaggerUI.setup(swaggerDocs, swaggerOptions)
    );
    //Set all routes from routes folder
    app.use("/api", routes);
    app.use((_req, _res, next) => {
      const error = new Error("Not found");
      error.status = 404;
      next(error);
    });

    // error handler middleware
    app.use((error, _req, res, _next) => {
      res.status(error.status || 500).send({
        error: {
          status: error.status || 500,
          message: error.message || "Internal Server Error",
        },
      });
    });
    app.listen(process.env.PORT || 3000, () => {
      console.log("🏃 Running Server");
    });
  })
  .catch((error) => console.log(error));
