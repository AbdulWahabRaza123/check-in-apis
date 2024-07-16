const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CHeckin APIs",
      version: "1.0.0",
      description: "API Documentation of Holla gorilla",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to the API docs
};

const specs = swaggerJsDoc(options);

module.exports = {
  swaggerUi,
  specs,
};
