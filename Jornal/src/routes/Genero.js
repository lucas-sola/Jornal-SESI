const express = require("express");
const router = express.Router();
const generoController = require("../controller/Genero.js");

router.get("/", generoController.listarGeneros);
router.get("/:id", generoController.buscarGenero);
router.post("/", generoController.cadastrarGenero);
router.put("/:id", generoController.atualizarGenero);
router.delete("/:id", generoController.deletarGenero);

module.exports = router;
