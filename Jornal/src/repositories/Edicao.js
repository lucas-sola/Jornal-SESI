const pool = require("../config/database.js");

class EdicaoRepository {
  async listarEdicoes() {
    const [rows] = await pool.query("SELECT * FROM edicao");
    return rows;
  }

  async buscarEdicao(id) {
    const [rows] = await pool.query("SELECT * FROM edicao WHERE id = ?", [id]);
    return rows[0];
  }

  async cadastrarEdicao(dados) {
    const [result] = await pool.query("INSERT INTO edicao SET ?", [dados]);
    return result.insertId;
  }

  async atualizarEdicao(dados, id) {
    const [result] = await pool.query("UPDATE edicao SET ? WHERE id = ?", [dados, id]);
    return result.affectedRows;
  }

  async deletarEdicao(id) {
    await pool.query("UPDATE publicacao SET edicao_id = NULL WHERE edicao_id = ?", [id]);
    const [result] = await pool.query("DELETE FROM edicao WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = new EdicaoRepository();
