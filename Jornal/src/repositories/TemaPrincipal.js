const pool = require("../config/database.js");

class TemaPrincipalRepository {
  async listarTemasPrincipais() {
    const [rows] = await pool.query("SELECT * FROM temas_principais");
    return rows;
  }

  async buscarTemaPrincipal(id) {
    const [rows] = await pool.query("SELECT * FROM temas_principais WHERE id = ?", [id]);
    return rows[0];
  }

  async cadastrarTemaPrincipal(dados) {
    const [result] = await pool.query("INSERT INTO temas_principais SET ?", [dados]);
    return result.insertId;
  }

  async atualizarTemaPrincipal(dados, id) {
    const [result] = await pool.query("UPDATE temas_principais SET ? WHERE id = ?", [dados, id]);
    return result.affectedRows;
  }

  async deletarTemaPrincipal(id) {
    const [result] = await pool.query("DELETE FROM temas_principais WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = new TemaPrincipalRepository();
