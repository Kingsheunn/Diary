import { Router } from "express";
import EntriesController from "../controllers/EntriesController.js";
import UsersController from "../controllers/UsersController.js";
import authenticate from "../middleware/auth.js"
const router = Router();

// Welcome route
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
router.post("/api/v1/usersController/signup", UsersController.signUp);
router.post("/api/v1/usersController/login", UsersController.signIn);
router.get("/api/v1/profile", authenticate, UsersController.getUser);
router.put("/api/v1/profile", authenticate, UsersController.updateUser);

// Notification routes
router.put('/api/v1/reminder', authenticate, UsersController.setReminder);
router.get('/api/v1/reminder', authenticate, UsersController.getReminder);



export default router;
