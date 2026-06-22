const express = require("express");
const router = express.Router();
const publicacaoController = require("../controller/PublicacaoController.js");
const verificarAutor = require("../middlewares/verificarAutor.js");
const uploadPublicacao = require("../middlewares/uploadPublicacao.js");

const uploadImagemMiddleware = (req, res, next) => {
  uploadPublicacao.single("imagem_destaque")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ sucesso: false, erro: err.message });
    }
    next();
  });
};

router.get("/", publicacaoController.listarPublicacoes);
router.post(
  "/autor",
  verificarAutor,
  uploadImagemMiddleware,
  publicacaoController.cadastrarPublicacaoAutor
);
router.get("/:id", publicacaoController.buscarPublicacao);
router.post("/", publicacaoController.cadastrarPublicacao);
router.put("/:id", publicacaoController.atualizarPublicacao);
router.delete("/:id", publicacaoController.deletarPublicacao);

module.exports = router;
