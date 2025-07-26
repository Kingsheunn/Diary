import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import NotificationsService from "./services/NotificationsService.js";

// Swagger setup
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { readdirSync } from "fs";
import { join } from "path";
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
    { url: 'https://diary-roan.vercel.app', description: 'Production Server' },
    { url: 'http://localhost:5000', description: 'Development Server' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  }
};

// Load YAML files from swagger directory
let swaggerDocs = [];
try {
  const swaggerDir = join(process.cwd(), "Backend", "swagger");
  const yamlFiles = readdirSync(swaggerDir).filter(file => file.endsWith('.yaml'));
  swaggerDocs = yamlFiles.map(file => {
    try {
      return YAML.load(join(swaggerDir, file));
    } catch (e) {
      console.error(`Error parsing Swagger file ${file}:`, e);
      return null;
    }
  }).filter(doc => doc !== null && doc !== undefined);
} catch (e) {
  console.error('Error reading swagger directory:', e);
}

// Combine all Swagger definitions
const combinedPaths = {};
const combinedComponents = {
  schemas: {},
  securitySchemes: { ...swaggerDefinition.components.securitySchemes }
};

swaggerDocs.forEach(doc => {
  Object.assign(combinedPaths, doc.paths || {});
  if (doc.components) {
    Object.assign(combinedComponents.schemas, doc.components.schemas || {});
    Object.assign(combinedComponents.securitySchemes, doc.components.securitySchemes || {});
  }
});

// Create final Swagger specification
const swaggerSpec = {
  ...swaggerDefinition,
  paths: combinedPaths,
  components: combinedComponents
};

// Serve the generated swagger spec as a JSON file
app.get("/api-docs/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Swagger UI route
const swaggerUiOptions = {
  swaggerOptions: {
    url: "/api-docs/swagger.json",
  },
};
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(null, swaggerUiOptions));


// Start the server
if (!process.env.VERCEL) {
  app.listen(port, async () => {
    console.log(`Server started on port ${port}`);
    try {
      await NotificationsService.scheduleReminders();
      console.log('Notification scheduler started successfully');
    } catch (error) {
      console.error('Failed to start notification scheduler:', error);
    }
  });
}

export default app;
