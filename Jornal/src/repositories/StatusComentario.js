const pool = require("../config/database.js");

class StatusComentarioRepository {
  async listarStatusComentario() {
    const [rows] = await pool.query("SELECT * FROM status_comentario");
    return rows;
  }

  async buscarStatusComentario(id) {
    const [rows] = await pool.query("SELECT * FROM status_comentario WHERE id = ?", [id]);
    return rows[0];
  }

  async cadastrarStatusComentario(dados) {
    const [result] = await pool.query("INSERT INTO status_comentario SET ?", [dados]);
    return result.insertId;
  }

  async atualizarStatusComentario(dados, id) {
    const [result] = await pool.query("UPDATE status_comentario SET ? WHERE id = ?", [dados, id]);
    return result.affectedRows;
  }

  async deletarStatusComentario(id) {
    const [result] = await pool.query("DELETE FROM status_comentario WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = new StatusComentarioRepository();
