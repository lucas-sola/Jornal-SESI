const express = require("express");
const router = express.Router();
const edicaoController = require("../controller/Edicao.js");

router.get("/", edicaoController.listarEdicoes);
router.get("/:id", edicaoController.buscarEdicao);
router.post("/", edicaoController.cadastrarEdicao);
router.put("/:id", edicaoController.atualizarEdicao);
router.delete("/:id", edicaoController.deletarEdicao);

module.exports = router;
