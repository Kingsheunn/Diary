import pool from "../models/users.js";
import schedule from "node-schedule";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
class NotificationService {
  static async setReminder(remind, userId) {
    await pool.query("UPDATE users SET reminder = $1 WHERE id = $2", [
      remind,
      userId,
    ]);
    return true;
  }

  static async getReminder(userId) {
    const result = await pool.query(
      "SELECT reminder FROM users WHERE id = $1",
      [userId]
    );
    return result.rows;
  }

  static async getUsersToRemind() {
    const result = await pool.query("SELECT email, name FROM users WHERE reminder = $1", [
      true,
    ]);
    return result.rows;
  }

  static async scheduleReminders() {
    console.log("Mailer Started");
    const remindList = await this.getUsersToRemind();
    if (remindList.length === 0) {
      return console.log("No reminders set");
    }

    schedule.scheduleJob({ hour: 17, minute: 0 }, async () => {
      for (const rem of remindList) {
        try {
          await resend.emails.send({
            from: "Diario <diario@your-domain.com>",
            to: rem.email,
            subject: "How was your day today?",
            html: `
              <html>
                <body>
                  <p>Hi ${rem.name},</p>
                  <p>This is a quick email to remind you to write in your Diary Journal! Click the button below to create a new entry.</p>
                  <a href="https://mi-diario.herokuapp.com/home" style="display: inline-block; padding: 12px 25px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px;">Create a new entry</a>
                  <p>&copy; Diario</p>
                </body>
              </html>
            `,
          });
          console.log(`Reminder sent to ${rem.email}`);
        } catch (error) {
          console.error(`Failed to send reminder to ${rem.email}:`, error);
        }
      }
    });
  }
}

export default NotificationService;
