const pool = require("../config/database.js");

class GeneroRepository {
  async listarGeneros() {
    const [rows] = await pool.query("SELECT * FROM generos");
    return rows;
  }

  async buscarGenero(id) {
    const [rows] = await pool.query("SELECT * FROM generos WHERE id = ?", [id]);
    return rows[0];
  }

  async cadastrarGenero(dados) {
    const [result] = await pool.query("INSERT INTO generos SET ?", [dados]);
    return result.insertId;
  }

  async atualizarGenero(dados, id) {
    const [result] = await pool.query("UPDATE generos SET ? WHERE id = ?", [dados, id]);
    return result.affectedRows;
  }

  async deletarGenero(id) {
    const [result] = await pool.query("DELETE FROM generos WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = new GeneroRepository();
