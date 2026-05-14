const ProdutoService = require("./saborDigitalServices");
const erroCatch = require("./errorHelperSaborDigital");

class ProdutoController {
  async listarProduto(req, res) {
    try {
      const result = await ProdutoService.listarProduto();
      res.json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }
  async listarProdutoId(req, res) {
    try {
      const result = await ProdutoService.listarProdutosPorId();
      res.json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }
  async cadastrarProduto(req, res) {
    try {
      const result = await ProdutoService.cadastrarProduto(req.body);
      res.json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }
  async atualizarProduto(req, res) {
    try {
      const result = ProdutoService.atualizarProduto(req.body, req.params.id);
      res.json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }
  async deletarProduto() {
    try {
      const result = ProdutoService.deletarProduto(req.params.id);
      res.json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }
}

module.exports = new ProdutoController();
