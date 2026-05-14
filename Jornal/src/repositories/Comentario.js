const pool = require("../config/database.js");

class ComentarioRepository {
  async listarComentarios() {
    const [rows] = await pool.query("SELECT * FROM comentario");
    return rows;
  }

  async buscarComentario(id) {
    const [rows] = await pool.query("SELECT * FROM comentario WHERE id = ?", [id]);
    return rows[0];
  }

  async cadastrarComentario(dados) {
    const [result] = await pool.query("INSERT INTO comentario SET ?", [dados]);
    return result.insertId;
  }

  async atualizarComentario(dados, id) {
    const [result] = await pool.query("UPDATE comentario SET ? WHERE id = ?", [dados, id]);
    return result.affectedRows;
  }

  async deletarComentario(id) {
    const [result] = await pool.query("DELETE FROM comentario WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = new ComentarioRepository();
