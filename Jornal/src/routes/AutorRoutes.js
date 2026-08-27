const express = require("express");
const router = express.Router();
const autorController = require("../controller/AutorController.js");
const upload = require("../middlewares/uploadAutor.js");
const { verificarAuth } = require("../middlewares/verificarAuth.js");

// Helper para capturar erros do Multer e responder com JSON
const uploadMiddleware = (req, res, next) => {
  upload.single("profileImage")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ sucesso: false, erro: err.message });
    }
    next();
  });
};

const verificarProprioUsuarioOuAdmin = (req, res, next) => {
  const usuarioId = req.usuario?.id || req.headers["x-usuario-id"];
  const ehAdmin = req.usuario?.cargo === "admin";
  const { id } = req.params;

  if (!usuarioId || (String(usuarioId) !== String(id) && !ehAdmin)) {
    return res.status(403).json({
      sucesso: false,
      erro: "Acesso negado. Apenas o próprio usuário ou um administrador pode ver ou alterar estas informações.",
    });
  }

  next();
};

router.get("/", autorController.listarAutores);
router.post("/", autorController.cadastrarAutor);

// Dados pessoais privados (CPF, telefone)
router.get("/:id/dados-pessoais", verificarAuth, verificarProprioUsuarioOuAdmin, autorController.buscarDadosPessoais);
router.put("/:id/dados-pessoais", verificarAuth, verificarProprioUsuarioOuAdmin, autorController.atualizarDadosPessoais);

router.get("/:id", autorController.buscarAutor);
router.put("/:id", verificarAuth, verificarProprioUsuarioOuAdmin, autorController.atualizarAutor);
router.delete("/:id", verificarAuth, verificarProprioUsuarioOuAdmin, autorController.deletarAutor);

// Novas rotas para foto de perfil
router.get("/:id/profile-image", autorController.buscarFotoPerfil);
router.post("/:id/profile-image", verificarAuth, verificarProprioUsuarioOuAdmin, uploadMiddleware, autorController.atualizarFotoPerfil);
router.put("/:id/profile-image", verificarAuth, verificarProprioUsuarioOuAdmin, uploadMiddleware, autorController.atualizarFotoPerfil);
router.delete("/:id/profile-image", verificarAuth, verificarProprioUsuarioOuAdmin, autorController.deletarFotoPerfil);

module.exports = router;
