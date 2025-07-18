import UsersService from "../services/UsersService.js";
import validateUser from "../validators/validateUser.js";
import { validateReminder } from "../validators/validateReminder.js";
import pool from "../models/users.js";

class UsersController {
  static async signIn(req, res, next) {
    try {
      const result = await UsersService.signIn(req.body.email, req.body.password);
      if (!result) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      res.status(200).json({
        user: { name: result.user },
        message: "Login successful",
        token: result.token,
      });
    } catch (err) {
      next(err);
    }
  }

  static async signUp(req, res, next) {
    try {
      const result = await UsersService.signUp(req.body);
      res.status(201).json({
        user: result.user,
        message: "Account created successfully",
        token: result.token,
      });
    } catch (err) {
      if (err.message === 'Email already exists') {
        return res.status(409).json({ message: err.message });
      }
      next(err);
    }
  }

  static async getUser(req, res) {
    const user = await UsersService.getUser(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      email: user.email,
      name: user.name,
      message: "User details retrieved successfully",
    });
  }

  static async updateUser(req, res) {
    const { error } = validateUser(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    await UsersService.updateUser(req.body.name, req.body.email, req.user.id);

    res.status(200).json({ message: "Profile updated successfully" });
  }

  static async setReminder(req, res) {
    try {
      // Handle both old format (req.body.remind) and new format (req.body.dailyReminder, etc.)
      let reminderSettings;
      
      if (req.body.remind !== undefined) {
        // Old format - convert to new format
        reminderSettings = {
          dailyReminder: req.body.remind,
          reminderTime: '17:00',
          weeklyReminder: false,
          summaryDay: '1'
        };
      } else {
        // New format from frontend
        reminderSettings = {
          dailyReminder: req.body.dailyReminder || false,
          reminderTime: req.body.reminderTime || '09:00',
          weeklyReminder: req.body.weeklyReminder || false,
          summaryDay: req.body.summaryDay || '1'
        };
      }

      await UsersService.setReminder(req.user.id, reminderSettings);

      res.status(200).json({ message: "Reminder settings saved successfully" });
    } catch (error) {
      console.error('Set reminder error:', error);
      res.status(500).json({ message: "Failed to save reminder settings" });
    }
  }

  static async getReminder(req, res) {
    try {
      const reminderData = await UsersService.getReminder(req.user.id);

      res.status(200).json(reminderData);
    } catch (error) {
      console.error('Get reminder error:', error);
      res.status(500).json({ message: "Failed to get reminder settings" });
    }
  }
  
  // Test cleanup endpoint (for development only)
  static async testCleanup(req, res) {
    if (process.env.NODE_ENV !== 'production') {
      try {
        // Delete test users and entries
        await pool.query("DELETE FROM users WHERE email LIKE 'test%@example.com'");
        await pool.query("DELETE FROM entries WHERE title = 'Test Entry' OR title = 'Updated Test Entry'");
        res.status(200).json({ message: 'Test data cleared successfully' });
      } catch (error) {
        console.error('Test cleanup error:', error);
        res.status(500).json({ error: 'Failed to clear test data' });
      }
    } else {
      res.status(403).json({ error: 'Test cleanup not allowed in production' });
    }
  }
};

export default UsersController;
