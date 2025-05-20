import cron from 'node-cron';

const scheduledTasks = new Map();

export function scheduleReminder(user) {
  const [hour, minute] = user.reminderTime.split(':');
  const cronTime = `${minute} ${hour} * * *`;

  const task = cron.schedule(cronTime, () => {
    console.log(`Reminder: Hey ${user.name}, time to write in your diary!`);
  });

  // Store task by user ID
  scheduledTasks.set(user.id, task);
}

export default function clearAllReminders() {
  for (const task of scheduledTasks.values()) {
    task.stop();
  }
  scheduledTasks.clear();
}
