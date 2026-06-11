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

router.get("/", autorController.listarAutores);
router.get("/:id", autorController.buscarAutor);
router.post("/", autorController.cadastrarAutor);
router.put("/:id", autorController.atualizarAutor);
router.delete("/:id", autorController.deletarAutor);

// Novas rotas para foto de perfil
router.get('/:id/profile-image', autorController.buscarFotoPerfil);
router.post('/:id/profile-image', uploadMiddleware, autorController.atualizarFotoPerfil);
router.put('/:id/profile-image', uploadMiddleware, autorController.atualizarFotoPerfil);
router.delete('/:id/profile-image', autorController.deletarFotoPerfil);

module.exports = router;
