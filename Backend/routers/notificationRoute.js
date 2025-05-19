import express from 'express';
import NotificationController from '../controllers/NotificationsController.js';

const notificationRoutes  = express.Router();

notificationRoutes.post('/', NotificationController.setReminder);

export default notificationRoutes ;
