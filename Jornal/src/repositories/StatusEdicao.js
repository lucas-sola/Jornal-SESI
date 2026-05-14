const pool = require("../config/database.js");

class StatusEdicaoRepository {
  async listarStatusEdicao() {
    const [rows] = await pool.query("SELECT * FROM status_edicao");
    return rows;
  }

  async buscarStatusEdicao(id) {
    const [rows] = await pool.query("SELECT * FROM status_edicao WHERE id = ?", [id]);
    return rows[0];
  }

  async cadastrarStatusEdicao(dados) {
    const [result] = await pool.query("INSERT INTO status_edicao SET ?", [dados]);
    return result.insertId;
  }

  async atualizarStatusEdicao(dados, id) {
    const [result] = await pool.query("UPDATE status_edicao SET ? WHERE id = ?", [dados, id]);
    return result.affectedRows;
  }

  async deletarStatusEdicao(id) {
    const [result] = await pool.query("DELETE FROM status_edicao WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = new StatusEdicaoRepository();
