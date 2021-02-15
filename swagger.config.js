const prod = process.env.NODE_ENV === "production";

module.exports.swaggerDocument = {
  definition: {
    openapi: "3.0.0", // Specification (optional, defaults to swagger: '2.0')
    info: {
      title: "API Rest IMDb - Test Backend", // Title (required)
      version: "1.0.0", // Version (required)
    },
    components: {
      securitySchemes: {
        Bearer: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          in: "header",
          name: 'authorization'
        },
      },
    },
    schemes: ["http", "https"],
    securityDefinitions: {
      Bearer: {
        type: "apiKey",
        name: "authorization",
        in: "header",
      },
    },
  },
  host: `localhost:${process.env.PORT || 3000}`,
  basepath: "/api",
  servers: [`http://localhost:${process.env.PORT || 3000}`],
  // Path to the API docs
  apis: [`${prod ? "build" : "src"}/controllers/**/*.${prod ? "js" : "ts"}`],
};

module.exports.swaggerOptions = {
  explorer: false,
};
