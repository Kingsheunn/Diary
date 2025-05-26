import pool from "../models/users.js";

class UsersService {
  static async getAllUsers() {
    const res = await pool.query("SELECT * FROM users ORDER BY id");
    return res.rows;
  }

  static async getUserById(id) {
    const res = await pool.query("SELECT * FROM users WHERE id = $1", [
      Number(id),
    ]);
    return res.rows[0] || null;
  }

  static async createUser({ name, email, password }) {
    const res = await pool.query(
      "INSERT INTO users(name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, password]
    );
    return res.rows[0];
  }

  static async updateUser(id, { name, email, password }) {
    const res = await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        password = COALESCE($3, password)
      WHERE id = $4 RETURNING *`,
      [name, email, password, Number(id)]
    );
    return res.rows[0] || null;
  }

  static async deleteUser(id) {
    const res = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [Number(id)]
    );
    return res.rows[0] || null;
  }
}

export default UsersService;
