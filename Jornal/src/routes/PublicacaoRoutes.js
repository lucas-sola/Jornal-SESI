const express = require("express");
const router = express.Router();
const publicacaoController = require("../controller/PublicacaoController.js");
const { verificarAuth, verificarAdmin } = require("../middlewares/verificarAuth.js");
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
router.get("/:id", publicacaoController.buscarPublicacao);

// Rotas restritas exclusivamente para administradores
router.post(
  "/autor",
  verificarAuth,
  verificarAdmin,
  uploadImagemMiddleware,
  publicacaoController.cadastrarPublicacaoAutor
);
router.post("/", verificarAuth, verificarAdmin, publicacaoController.cadastrarPublicacao);
// Autores podem alterar/remover as próprias publicações; admins, qualquer publicação.
router.put("/:id", verificarAuth, publicacaoController.atualizarPublicacao);
router.delete("/:id", verificarAuth, publicacaoController.deletarPublicacao);

module.exports = router;
