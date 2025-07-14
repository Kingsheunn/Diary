import express from "express";
import EntriesController from "../controllers/EntriesController.js";
import UsersController from "../controllers/UsersController.js";
import authenticate from "../middleware/auth.js";
import validateSignInMiddleware from '../validators/validateSignIn.js';
import validateSignUpMiddleware from '../validators/validateSignUp.js';
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function configureRoutes(app) {
  // API Routes
  app.get("/api/v1", (req, res) => {
    res.status(200).json({
      status: "Success",
      message: "Welcome to My Diary Api v1.0.0",
    });
  });

  // Entry routes
  app.get("/api/v1/entries", authenticate, EntriesController.getAllEntries);
  app.get("/api/v1/entries/:id", authenticate, EntriesController.getEntryById);
  app.post("/api/v1/entries", authenticate, EntriesController.createEntry);
  app.put("/api/v1/entries/:id", authenticate, EntriesController.updateEntry);
  app.delete("/api/v1/entries/:id", authenticate, EntriesController.removeEntry);

  // User routes
  app.post("/api/v1/auth/signup", validateSignUpMiddleware, UsersController.signUp);
  app.post("/api/v1/auth/login", validateSignInMiddleware, UsersController.signIn);
  app.get("/api/v1/profile", authenticate, UsersController.getUser);
  app.put("/api/v1/profile", authenticate, UsersController.updateUser);

  // Notification routes
  app.put('/api/v1/reminder', authenticate, UsersController.setReminder);
  app.get('/api/v1/reminder', authenticate, UsersController.getReminder);

  // Test cleanup route
  app.delete('/test-cleanup', UsersController.testCleanup);

  // Serve static files
  app.use(express.static(path.join(__dirname, "../../UI")));

  // SPA fallback route
  app.get(/^(?!\/api\/v1).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../../UI/index.html"));
  });
}
