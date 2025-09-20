const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node Auth API",
      version: "1.0.0",
      description: "Authentication playground with JWT, OAuth, Sessions, TOTP, Magic Link",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    servers: [{ url: "http://localhost:4000" }],
  },
  apis: ["./routes/*.js"], // path to your route files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = (app) => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
