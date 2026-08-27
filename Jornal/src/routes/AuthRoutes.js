const express = require("express");
const router = express.Router();
const authController = require("../controller/AuthController.js");
const { verificarAuth } = require("../middlewares/verificarAuth.js");

router.post("/login", authController.login);
router.post("/registro", authController.registrar);
router.get("/me", verificarAuth, authController.me);

module.exports = router;
