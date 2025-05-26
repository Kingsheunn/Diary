import { Router } from "express";
import EntriesController from "../controllers/EntriesController.js";
import UsersController from "../controllers/UsersController.js";

const router = Router();

// Welcome route
router.get("/api/v1", (req, res) => {
  res.status(200).json({
    status: "Success",
    message: "Welcome to My Diary Api v1.0.0",
  });
});

// Entry routes
router.get("/api/v1/entries", EntriesController.getAllEntries);
router.get('/api/v1/users/:userId/entries', EntriesController.getByUserId);
router.get("/api/v1/entries/:id", EntriesController.getEntry);
router.post("/api/v1/entries", EntriesController.createEntry);
router.put("/api/v1/entries/:id", EntriesController.updateEntry);
router.delete("/api/v1/entries/:id", EntriesController.removeEntry);

// User routes
router.get("/api/v1/users", UsersController.getAll);
router.get("/api/v1/users/:id", UsersController.getById);
router.post("/api/v1/users", UsersController.create);
router.put("/api/v1/users/:id", UsersController.update);
router.delete("/api/v1/users/:id", UsersController.delete);

const routes = (app) => {
  app.use(router); // Use the router for all defined routes
};

export default routes;
