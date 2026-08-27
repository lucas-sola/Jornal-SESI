const authService = require("../services/AuthService.js");
const { erroCatch } = require("../utils/errorJornal.js");

class AuthController {
  async login(req, res) {
    try {
      const { identificador, email, nome, senha } = req.body;
      const idUsuario = identificador || email || nome;
      const result = await authService.login(idUsuario, senha);
      res.status(200).json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }

  async registrar(req, res) {
    try {
      const result = await authService.registrar(req.body);
      res.status(201).json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }

  async me(req, res) {
    try {
      const usuarioId = req.usuario?.id || req.autorId;
      const result = await authService.me(usuarioId);
      res.status(200).json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }
}

module.exports = new AuthController();
