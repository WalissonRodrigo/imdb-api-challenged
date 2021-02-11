const builderUrl = () => {
  if (process.env.DB_URL) {
    return process.env.DB_URL;
  }
  const SERVER = {
    TYPE: process.env.DB_TYPE,
    HOST: process.env.DB_HOST,
    PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : "",
    USERNAME: process.env.DB_USERNAME,
    PASSWORD: process.env.DB_PASSWORD,
    DATABASE: process.env.DB_NAME,
  };
  const DB_URL = `${SERVER.TYPE}://${SERVER.USERNAME}:${SERVER.PASSWORD}@${SERVER.HOST}:${SERVER.PORT}`;
  return DB_URL;
};
const builderConnection = () => {
  const debug = process.env.NODE_ENV === 'production';
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
    entities: [`${debug ? 'build' : 'src'}/entity/**/*.${debug ? 'js' : 'ts'}`],
    migrations: [`${debug ? 'build' : 'src'}/migration/**/*.${debug ? 'js' : 'ts'}`],
    subscribers: [`${debug ? 'build' : 'src'}/subscriber/**/*.${debug ? 'js' : 'ts'}`],
    cli: {
      entitiesDir: "src/entity",
      migrationsDir: "src/migration",
      subscribersDir: "src/subscriber",
    },

  };
  if (!connection.url) delete connection.url;
  return connection;
};
module.exports = 
  {
    ...builderConnection()
  }
