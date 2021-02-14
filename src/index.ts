import "reflect-metadata";
import dotenv from "dotenv";
import { Connection, createConnection } from "typeorm";
import express from "express";
import App from "./app";
import { createServer, Server as HttpServer } from 'http';
dotenv.config();

(async function main() {
  try {
    const connection: Connection = await createConnection();

    // Init express server
    const app: express.Application = new App().app;
    const server: HttpServer = createServer(app);

    // Start express server
    server.listen(process.env.PORT || 3000, () => {
      console.log(`🏃 Running Server`);
    });

    server.on("close", () => {
      connection.close();
    });
  } catch (err) {
    console.error(err.stack);
  }
})();
