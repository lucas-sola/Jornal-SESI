const express = require("express");
const router = express.Router();
const autorController = require("../controller/AutorController.js");
const upload = require('../middlewares/uploadAutor.js');

// Helper para capturar erros do Multer e responder com JSON
const uploadMiddleware = (req, res, next) => {
  upload.single('profileImage')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ sucesso: false, erro: err.message });
    }
    next();
  });
};

const verificarProprioUsuario = (req, res, next) => {
  const usuarioId = req.headers['x-usuario-id'];
  const { id } = req.params;

  if (!usuarioId || String(usuarioId) !== String(id)) {
    return res.status(403).json({
      sucesso: false,
      erro: 'Acesso negado. Apenas o próprio usuário pode ver ou alterar estas informações.',
    });
  }

  next();
};

router.get("/", autorController.listarAutores);
router.post("/", autorController.cadastrarAutor);

// Dados pessoais privados (CPF, telefone)
router.get('/:id/dados-pessoais', verificarProprioUsuario, autorController.buscarDadosPessoais);
router.put('/:id/dados-pessoais', verificarProprioUsuario, autorController.atualizarDadosPessoais);

router.get("/:id", autorController.buscarAutor);
router.put("/:id", autorController.atualizarAutor);
router.delete("/:id", autorController.deletarAutor);

// Novas rotas para foto de perfil
router.get('/:id/profile-image', autorController.buscarFotoPerfil);
router.post('/:id/profile-image', uploadMiddleware, autorController.atualizarFotoPerfil);
router.put('/:id/profile-image', uploadMiddleware, autorController.atualizarFotoPerfil);
router.delete('/:id/profile-image', autorController.deletarFotoPerfil);

module.exports = router;
