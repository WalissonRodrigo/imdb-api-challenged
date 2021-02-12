const builderUrl = () => {
  if (process.env.DB_URL || process.env.DATABASE_URL) {
    return process.env.DB_URL || process.env.DATABASE_URL;
  }
  const SERVER = {
    TYPE: process.env.DB_TYPE,
    HOST: process.env.DB_HOST,
    PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : "",
    USERNAME: process.env.DB_USERNAME,
    PASSWORD: process.env.DB_PASSWORD,
    DATABASE: process.env.DB_NAME,
  };
  const DB_URL = `${SERVER.TYPE}://${SERVER.USERNAME}:${SERVER.PASSWORD}@${SERVER.HOST}:${SERVER.PORT}/${SERVER.DATABASE}`;
  return DB_URL;
};
const builderConnection = () => {
  const prod = process.env.NODE_ENV === "production";
  const connection = {
    name: "default",
    url: builderUrl(),
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : "",
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [`${prod ? "build" : "src"}/entity/**/*.${prod ? "js" : "ts"}`],
    migrations: [
      `${prod ? "build" : "src"}/migration/**/*.${prod ? "js" : "ts"}`,
    ],
    subscribers: [
      `${prod ? "build" : "src"}/subscriber/**/*.${prod ? "js" : "ts"}`,
    ],
    cli: {
      entitiesDir: "src/entity",
      migrationsDir: "src/migration",
      subscribersDir: "src/subscriber",
    },
  };
  if (!connection.url) delete connection.url;
  else {
    delete connection.host;
    delete connection.port;
    delete connection.username;
    delete connection.password;
    delete connection.database;
  }
  return connection;
};
module.exports = {
  ...builderConnection(),
};
