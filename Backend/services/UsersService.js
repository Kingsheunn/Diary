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
    try {
      const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );
      const user = existingUser.rows[0];
      if (user) {
        throw new Error('Email already exists');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const insertResult = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, email, created_at",
        [name, email, hashedPassword]
      );
      
      const newUser = insertResult.rows[0];
      const token = jwt.sign({ id: newUser.id }, process.env.JWT_KEY, {
        expiresIn: "1d",
      });

      return { user: newUser, token };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
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

  static async setReminder(userId, reminderSettings) {
    return NotificationService.setReminder(reminderSettings, userId);
  }

  static async getReminder(userId) {
    const result = await NotificationService.getReminder(userId);
    return result;
  }
}

export default UsersService;
