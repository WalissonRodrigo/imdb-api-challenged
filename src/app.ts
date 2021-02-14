/* eslint-disable @typescript-eslint/no-unused-vars */
import * as dotenv from "dotenv";
import "reflect-metadata";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import routes from "./routes";
import swaggerJSDoc = require("swagger-jsdoc");
import swaggerUI = require("swagger-ui-express");
import { swaggerDocument, swaggerOptions } from "../swagger.config";
dotenv.config();

export default class App {
  private readonly _app: express.Application = express();

  public constructor() {
    this._app.use(express.urlencoded({ extended: true }));
    this._app.use(express.json());
    this._app.use(cors());
    this._app.use(helmet());
    this._app.use(bodyParser.json());
    const swaggerDocs = swaggerJSDoc(swaggerDocument);
    this._app.use(
      "/api-docs",
      swaggerUI.serve,
      swaggerUI.setup(swaggerDocs, swaggerOptions)
    );
    // Set all routes from routes folder

    this._app.use("/api", routes);
    this._app.use((_req, _res, next) => {
      const error = new Error("Not found");
      error['status'] = 404;
      next(error);
    });

    // error handler middleware
    this._app.use((error, _req, res, _next) => {
      res.status(error.status || 500).send({
        error: {
          status: error.status || 500,
          message: error.message || "Internal error!",
        },
      });
    });
  }

  /**
   * Get Express app
   *
   * @returns {express.Application} Returns Express app
   */
  public get app(): express.Application {
    return this._app;
  }
}
