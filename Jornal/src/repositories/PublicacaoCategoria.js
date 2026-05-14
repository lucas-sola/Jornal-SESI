const pool = require("../config/database.js");

class PublicacaoCategoriaRepository {
  async listarVinculos() {
    const [rows] = await pool.query("SELECT * FROM publicacao_categoria");
    return rows;
  }

  async buscarVinculo(id) {
    const [rows] = await pool.query("SELECT * FROM publicacao_categoria WHERE id = ?", [id]);
    return rows[0];
  }

  async cadastrarVinculo(dados) {
    const [result] = await pool.query("INSERT INTO publicacao_categoria SET ?", [dados]);
    return result.insertId;
  }

  async atualizarVinculo(dados, id) {
    const [result] = await pool.query("UPDATE publicacao_categoria SET ? WHERE id = ?", [dados, id]);
    return result.affectedRows;
  }

  async deletarVinculo(id) {
    const [result] = await pool.query("DELETE FROM publicacao_categoria WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = new PublicacaoCategoriaRepository();
