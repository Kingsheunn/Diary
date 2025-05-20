import express from "express";
import bodyParser from "body-parser";
import routes from "./routers/index.js";
import notificationRoutes from './routers/notificationRoute.js';
import NotificationService from "./services/NotificationsService.js";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/v1/notifications', notificationRoutes);

// Register routes
routes(app);

NotificationService.initializeReminders();

// Start the server
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}

export default app; // Exporting app for testing purposes
