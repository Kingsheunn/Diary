import pool from "../models/users.js";
import schedule from "node-schedule";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
class NotificationService {
  static async setReminder(reminderSettings, userId) {
    await pool.query(
      "UPDATE users SET reminder = $1, reminder_time = $2, weekly_reminder = $3, summary_day = $4 WHERE id = $5",
      [
        reminderSettings.dailyReminder || false,
        reminderSettings.reminderTime || '09:00',
        reminderSettings.weeklyReminder || false,
        parseInt(reminderSettings.summaryDay) || 1,
        userId,
      ]
    );
    return true;
  }

  static async getReminder(userId) {
    const result = await pool.query(
      "SELECT reminder, reminder_time, weekly_reminder, summary_day FROM users WHERE id = $1",
      [userId]
    );
    
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        dailyReminder: row.reminder || false,
        reminderTime: row.reminder_time || '09:00',
        weeklyReminder: row.weekly_reminder || false,
        summaryDay: row.summary_day || 1
      };
    }
    
    return {
      dailyReminder: false,
      reminderTime: '09:00',
      weeklyReminder: false,
      summaryDay: 1
    };
  }

  static async getUsersWithReminders() {
    const result = await pool.query(
      "SELECT email, name, reminder, reminder_time, weekly_reminder, summary_day FROM users WHERE reminder = true OR weekly_reminder = true"
    );
    return result.rows;
  }

  static async scheduleReminders() {
    console.log("Notification service started");
    const usersWithReminders = await this.getUsersWithReminders();
    
    if (usersWithReminders.length === 0) {
      return console.log("No users with reminders found");
    }

    // Schedule daily reminders
    usersWithReminders.forEach(user => {
      try {
        if (user.reminder) {
          const timeStr = user.reminder_time || '09:00';
          const [hour, minute] = timeStr.split(':');
          schedule.scheduleJob(`daily-${user.email}`, { hour: parseInt(hour), minute: parseInt(minute) }, async () => {
            await this.sendDailyReminder(user.email, user.name);
          });
          console.log(`Daily reminder scheduled for ${user.email} at ${timeStr}`);
        }

        if (user.weekly_reminder) {
          const dayOfWeek = parseInt(user.summary_day) || 1;
          schedule.scheduleJob(`weekly-${user.email}`, { dayOfWeek, hour: 9, minute: 0 }, async () => {
            await this.sendWeeklySummary(user.email, user.name);
          });
          console.log(`Weekly summary scheduled for ${user.email} on day ${dayOfWeek}`);
        }
      } catch (error) {
        console.error(`Error scheduling reminders for ${user.email}:`, error);
      }
    });
  }

  static async sendDailyReminder(email, name) {
    try {
      console.log(`Attempting to send daily reminder to ${email}...`);
      const result = await resend.emails.send({
        from: "My Diary <diary@resend.dev>",
        to: email,
        subject: "Daily Diary Reminder - How was your day?",
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2da0a8;">Hi ${name}!</h2>
                <p>This is your daily reminder to write in your diary. Take a moment to reflect on your day and capture your thoughts.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.APP_URL || 'http://localhost:3000'}/entry/new" 
                     style="display: inline-block; padding: 12px 25px; background-color: #2da0a8; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Write New Entry
                  </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                  You can manage your notification settings in your profile.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                  &copy; My Diary - Your personal journaling companion
                </p>
              </div>
            </body>
          </html>
        `,
      });
      
      if (result.error) {
        console.error(`Failed to send daily reminder to ${email}:`, result.error);
      } else {
        console.log(`Daily reminder sent to ${email} - ID: ${result.data?.id}`);
      }
    } catch (error) {
      console.error(`Failed to send daily reminder to ${email}:`, error);
    }
  }

  static async sendWeeklySummary(email, name) {
    try {
      console.log(`Attempting to send weekly summary to ${email}...`);
      const result = await resend.emails.send({
        from: "My Diary <diary@resend.dev>",
        to: email,
        subject: "Weekly Diary Summary",
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2da0a8;">Hi ${name}!</h2>
                <p>Here's your weekly diary summary. Take a moment to reflect on the past week and see how you've grown.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard" 
                     style="display: inline-block; padding: 12px 25px; background-color: #2da0a8; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    View Your Entries
                  </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                  Keep up the great work with your journaling journey!
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                  &copy; My Diary - Your personal journaling companion
                </p>
              </div>
            </body>
          </html>
        `,
      });
      
      if (result.error) {
        console.error(`Failed to send weekly summary to ${email}:`, result.error);
      } else {
        console.log(`Weekly summary sent to ${email} - ID: ${result.data?.id}`);
      }
    } catch (error) {
      console.error(`Failed to send weekly summary to ${email}:`, error);
    }
  }
}

export default NotificationService;
