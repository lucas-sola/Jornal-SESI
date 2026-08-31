const express = require("express");
const router = express.Router();
const authController = require("../controller/AuthController.js");
const { verificarAuth, verificarTokenJWTObrigatorio } = require("../middlewares/verificarAuth.js");

router.post("/login", authController.login);
router.post("/registro", authController.registrar);
router.get("/me", verificarAuth, authController.me);
router.post("/alterar-senha", verificarTokenJWTObrigatorio, authController.alterarSenha);

module.exports = router;
