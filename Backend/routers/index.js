import express, { Router } from "express";
import EntriesController from "../controllers/EntriesController.js";
import UsersController from "../controllers/UsersController.js";
import authenticate from "../middleware/auth.js";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve static files
router.use(express.static(path.join(__dirname, "../../UI")));

// API Routes
router.get("/api/v1", (req, res) => {
  res.status(200).json({
    status: "Success",
    message: "Welcome to My Diary Api v1.0.0",
  });
});

// Entry routes
router.get("/api/v1/entries", authenticate, EntriesController.getAllEntries);
router.get("/api/v1/entries/:id", authenticate, EntriesController.getEntryById);
router.post("/api/v1/entries", authenticate, EntriesController.createEntry);
router.put("/api/v1/entries/:id", authenticate, EntriesController.updateEntry);
router.delete("/api/v1/entries/:id", authenticate, EntriesController.removeEntry);

// User routes
router.post("/api/v1/auth/signup", UsersController.signUp);
router.post("/api/v1/auth/login", UsersController.signIn);
router.get("/api/v1/profile", authenticate, UsersController.getUser);
router.put("/api/v1/profile", authenticate, UsersController.updateUser);

// Notification routes
router.put('/api/v1/reminder', authenticate, UsersController.setReminder);
router.get('/api/v1/reminder', authenticate, UsersController.getReminder);

// Frontend routes - handle all unmatched routes by serving index.html
router.get(/^(?!\/api\/v1).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../../UI/index.html"));
});

export default router;
