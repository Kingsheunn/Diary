import NotificationService from '../services/NotificationsService.js';

class NotificationController {
  static setReminder(req, res) {
    const { userId, time } = req.body;

    const updatedUser = NotificationService.setReminder(userId, time);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (updatedUser.status === 'disabled') {
      return res.status(200).json({ message: 'Reminder disabled successfully' });
    }

    const message = !time || time.toLowerCase() === 'off'
      ? 'Reminder disabled successfully'
      : 'Reminder time set successfully';

    res.status(200).json({ message, time });
  }
}

export default NotificationController;
