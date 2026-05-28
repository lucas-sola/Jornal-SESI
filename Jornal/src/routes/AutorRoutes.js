const express = require("express");
const router = express.Router();
const autorController = require("../controller/AutorController.js");
const upload = require('../middlewares/uploadAutor.js');

router.get("/", autorController.listarAutores);
router.get("/:id", autorController.buscarAutor);
router.post("/", autorController.cadastrarAutor);
router.put("/:id", autorController.atualizarAutor);
router.delete("/:id", autorController.deletarAutor);

// Novas rotas para foto de perfil
router.get('/:id/profile-image', autorController.buscarFotoPerfil);
router.post('/:id/profile-image', upload.single('profileImage'), autorController.atualizarFotoPerfil);
router.put('/:id/profile-image', upload.single('profileImage'), autorController.atualizarFotoPerfil);
router.delete('/:id/profile-image', autorController.deletarFotoPerfil);

module.exports = router;
