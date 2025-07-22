import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

// Swagger setup
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { join } from "path";
import configureRoutes from "./routers/index.js";

const app = express();
const port = process.env.PORT || 5000;

// Create a separate router for documentation that bypasses authentication
const docsRouter = express.Router();

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
  apis: ["./Backend/routers/index.js", "./Backend/controllers/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Add documentation routes to the docsRouter
docsRouter.get("/openapi.json", (req, res) => {
  res.json(swaggerSpec);
});

docsRouter.get("/swagger-ui.html", (req, res) => {
  res.sendFile(join(process.cwd(), "UI", "swagger-ui.html"));
});

docsRouter.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Apply documentation router (without authentication)
app.use(docsRouter);

// Configure main application routes (with authentication)
configureRoutes(app);

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
