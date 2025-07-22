import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

// Swagger setup
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import configureRoutes from "./routers/index.js";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure routes
configureRoutes(app);

// Swagger JSDoc configuration
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Diary API",
    version: "1.0.0",
    description: "API documentation for the Diary project",
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' ? 
           'https://diary-roan.vercel.app' : 
           'http://localhost:5000',
      description: process.env.NODE_ENV === 'production' ? 
                   'Production server' : 
                   'Development server'
    },
    {
      url: "http://localhost:5000",
      description: "Local development server"
    }
  ],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ["./Backend/routers/*.js", "./Backend/controllers/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Serve OpenAPI specification
app.get("/openapi.json", (req, res) => {
  res.json(swaggerSpec);
});

// Swagger UI route - simplified version
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("=== ERROR DETAILS ===");
  console.error("Error message:", err.message);
  console.error("Error stack:", err.stack);
  console.error("Request URL:", req.url);
  console.error("Request method:", req.method);
  console.error("Request body:", req.body);
  console.error("=====================");

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Internal Server Error" : err.message;
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start the server
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server started on port${port}`);
  });
}

export default app;
