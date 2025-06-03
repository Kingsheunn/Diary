import pool from '../models/users.js';

const EntriesService = {
  async getAllEntries(user_id) {
    const  res  = await pool.query('SELECT * FROM entries WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
    return res.rows;
  },


  async getEntryById(id, user_id) {
    const  result = await pool.query('SELECT * FROM entries WHERE id = $1 AND user_id = $2', [id, user_id]);
    return result.rows[0];
  },

  async createEntry(user_id, title, content) {
    const  result  = await pool.query(
      'INSERT INTO entries (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [user_id, title, content]
    );
    return result.rows[0];
  },

  async updateEntry(title, content, id, user_id) {
    const  result  = await pool.query(
      'UPDATE entries SET title = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [title, content, id, user_id]
    );
    return result.rows[0];
  },

  async deleteEntry(id, user_id) {
    const  result  = await pool.query('DELETE FROM entries WHERE id = $1 AND user_id = $2 RETURNING *', [id, user_id]);
    return result.rows[0];
  }
};

export default EntriesService;
