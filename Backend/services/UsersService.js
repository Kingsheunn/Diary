import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../models/users.js";
import NotificationService from "./NotificationsService.js";

class UsersService {
  static async signIn(email, password) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];
    if (!user) return null;

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return null;

    const token = jwt.sign({ id: user.id }, process.env.JWT_KEY, {
      expiresIn: "1d",
    });

    return {
      user: user.name,
      token,
    };
  }

  static async signUp({ name, email, password }) {
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    const user = existingUser.rows[0];
    if (user) return null;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );

    const result = await pool.query(
      "SELECT id, email, created_at FROM users WHERE email = $1",
      [email]
    );
    const newUser = result.rows[0];
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_KEY, {
      expiresIn: "1d",
    });

    return { user: newUser, token };
  }

  static async getUser(userId) {
    const result = await pool.query(
      "SELECT email, name, created_at FROM users WHERE id = $1",
      [userId]
    );
    return result.rows[0] || null;
  }

  static async updateUser(name, email, userId) {
    const result = await pool.query("UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *", [
      name,
      email,
      userId,
    ]);
    return result.rows[0] || null;
  }

  static async setReminder(userId, reminderStatus) {
    return NotificationService.setReminder(reminderStatus, userId);
  }

  static async getReminder(userId) {
    const result = await NotificationService.getReminder(userId);
    // NotificationService.getReminder returns an array, so get first item
    return {
      reminder: result && result.length > 0 ? result[0].reminder : false,
    };
  }
}

export default UsersService;
