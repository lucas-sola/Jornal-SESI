const pool = require("../config/database.js");

class CategoriaRepository {
  async listarCategorias() {
    const [rows] = await pool.query("SELECT * FROM categorias");
    return rows;
  }

  async buscarCategoria(id) {
    const [rows] = await pool.query("SELECT * FROM categorias WHERE id = ?", [id]);
    return rows[0];
  }

  async cadastrarCategoria(dados) {
    const [result] = await pool.query("INSERT INTO categorias SET ?", [dados]);
    return result.insertId;
  }

  async atualizarCategoria(dados, id) {
    const [result] = await pool.query("UPDATE categorias SET ? WHERE id = ?", [dados, id]);
    return result.affectedRows;
  }

  async deletarCategoria(id) {
    const [result] = await pool.query("DELETE FROM categorias WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = new CategoriaRepository();
