const express = require("express");
const router = express.Router();
const comentarioController = require("../controller/Comentario.js");

router.get("/", comentarioController.listarComentarios);
router.get("/:id", comentarioController.buscarComentario);
router.post("/", comentarioController.cadastrarComentario);
router.put("/:id", comentarioController.atualizarComentario);
router.delete("/:id", comentarioController.deletarComentario);

module.exports = router;
