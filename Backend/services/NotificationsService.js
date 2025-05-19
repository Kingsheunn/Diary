import users from '../models/users.js';
import  scheduleReminder  from '../utilities/reminderScheduler.js';

class NotificationService {
  static setReminder(userId, time) {
    const user = users.find(u => u.id === parseInt(userId, 10));
    if (!user) return null;

    user.reminderTime = time;

    if (!time || time.toLowerCase() === 'off') {
      return user;
    }
    scheduleReminder(user);
    return user;
  }

  static initializeReminders() {
    users.forEach(user => {
      if (user.reminderTime && user.reminderTime.toLowerCase() !== 'off') {
        scheduleReminder(user);
      }
    });
  }
}

export default NotificationService;