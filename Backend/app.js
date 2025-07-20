import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

// Swagger setup
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
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
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      Entry: {
        type: "object",
        properties: {
          id: {
            type: "integer"
          },
          user_id: {
            type: "integer"
          },
          title: {
            type: "string"
          },
          content: {
            type: "string"
          },
          created_at: {
            type: "string",
            format: "date-time"
          },
          updated_at: {
            type: "string",
            format: "date-time"
          }
        }
      },
      EntryInput: {
        type: "object",
        required: ["title", "content"],
        properties: {
          title: {
            type: "string"
          },
          content: {
            type: "string"
          }
        }
      },
      User: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: {
            type: "string"
          },
          email: {
            type: "string",
            format: "email"
          },
          password: {
            type: "string",
            format: "password"
          }
        }
      }
    }
  }
};

// Load YAML files from swagger directory
const swaggerDir = join(process.cwd(), "Backend", "swagger");
const yamlFiles = readdirSync(swaggerDir).filter(file => file.endsWith('.yaml'));
const swaggerDocs = yamlFiles.map(file => YAML.load(join(swaggerDir, file)));

// Combine all Swagger definitions
const combinedPaths = {};
const combinedComponents = { schemas: {}, securitySchemes: {} };

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

// Swagger UI route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Configure routes
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
