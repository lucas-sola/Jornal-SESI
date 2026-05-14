const pool = require("../config/database.js");

class SaborDigital {
  async listarProdutos() {
    const listaProdutos = await pool.query("SELECT * FROM produto");
    return listaProdutos;
  }
  async buscarProduto(id) {
    const produtoEncontrado = await pool.query(
      "SELECT * FROM produto WHERE id = ?",
      [id],
    );
    return produtoEncontrado[0];
  }
  async cadastrarProduto({ dados }) {
    const produtoCadastrado = await pool.query("INSERT INTO produto SET ?", [
      dados,
    ]);
    return produtoCadastrado.insertId;
  }
  async atualizarProduto(dadosProduto, id) {
    const camposProduto = [];
    const valorProduto = [];
    for (const [key, value] of Object.entries(dadosProduto)) {
      camposProduto.push(`${key} = ?`);
      valorProduto.push(value);
    }
    if (!camposProduto) return null;
    valorProduto.push(id);
    const query = `UPDATE produto SET ${camposProduto.join(",")} WHERE id = ?`;
    const result = await pool.query(query, valorProduto)
    
    return result.affectedRows

  }
  async apagarProduto(id) {
    const result = await pool.query("DELETE FROM produto WHERE id = ?", [id]);
    return true;
  }
}

module.exports = new SaborDigital();
