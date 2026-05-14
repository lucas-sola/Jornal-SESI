const pool = require("../config/database.js");

class PublicacaoRepository {
  async listarPublicacoes() {
    const [rows] = await pool.query("SELECT * FROM publicacao");
    return rows;
  }

  async buscarPublicacao(id) {
    const [rows] = await pool.query("SELECT * FROM publicacao WHERE id = ?", [id]);
    return rows[0];
  }

  async cadastrarPublicacao(dados) {
    const [result] = await pool.query("INSERT INTO publicacao SET ?", [dados]);
    return result.insertId;
  }

  async atualizarPublicacao(dados, id) {
    const [result] = await pool.query("UPDATE publicacao SET ? WHERE id = ?", [dados, id]);
    return result.affectedRows;
  }

  async deletarPublicacao(id) {
    await pool.query("DELETE FROM publicacao_categoria WHERE publicacao_id = ?", [id]);
    await pool.query("DELETE FROM comentario WHERE publicacao_id = ?", [id]);
    const [result] = await pool.query("DELETE FROM publicacao WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = new PublicacaoRepository();
