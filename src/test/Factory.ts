import * as dotenv from "dotenv";
import "reflect-metadata";

// Set env variables from .env file
dotenv.config();

import { createConnection, ConnectionOptions, Connection } from "typeorm";
import { createServer, Server as HttpServer } from "http";

import * as express from "express";
import * as supertest from "supertest";

import Server from "../app";

/**
 * TestFactory
 * - Loaded in each unit test
 * - Starts server and DB connection
 */
const prod = process.env.NODE_ENV === "production";

export class TestFactory {
  private _app: express.Application;
  private _connection: Connection;
  private _server: HttpServer;

  // DB connection options
  private options: ConnectionOptions = {
    type: "sqljs",
    database: new Uint8Array(),
    location: "database",
    logging: false,
    synchronize: true,
    entities: [`${prod ? "build" : "src"}/entity/**/*.${prod ? "js" : "ts"}`],
  };

  public get app(): supertest.SuperTest<supertest.Test> {
    return supertest(this._app);
  }

  public get connection(): Connection {
    return this._connection;
  }

  public get server(): HttpServer {
    return this._server;
  }

  public async init(): Promise<void> {
    await this.startup();
  }

  /**
   * Close server and DB connection
   */
  public async close(): Promise<void> {
    this._server.close();
    this._connection.close();
  }

  /**
   * Connect to DB and start server
   */
  private async startup(): Promise<void> {
    this._connection = await createConnection(this.options);
    this._app = new Server().app;
    this._server = createServer(this._app).listen(process.env.PORT);
  }
}
