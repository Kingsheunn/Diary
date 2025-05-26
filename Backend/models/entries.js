import pool from './users.js';

const EntriesModel = {
  async getAllEntries() {
    const { rows } = await pool.query('SELECT * FROM entries');
    return rows;
  },

  async getEntriesByUserId(userId) {
    const { rows } = await pool.query('SELECT * FROM entries WHERE user_id = $1', [userId]);
    return rows;
  },

  async getEntryById(id) {
    const { rows } = await pool.query('SELECT * FROM entries WHERE id = $1', [id]);
    return rows[0];
  },

  async createEntry({ user_id, title, content }) {
    const { rows } = await pool.query(
      'INSERT INTO entries (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [user_id, title, content]
    );
    return rows[0];
  },

  async updateEntry(id, { title, content }) {
    const { rows } = await pool.query(
      'UPDATE entries SET title = $1, content = $2 WHERE id = $3 RETURNING *',
      [title, content, id]
    );
    return rows[0];
  },

  async deleteEntry(id) {
    const { rows } = await pool.query('DELETE FROM entries WHERE id = $1 RETURNING *', [id]);
    return rows[0];
  }
};

export default EntriesModel;
