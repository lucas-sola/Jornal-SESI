const express = require("express");
const router = express.Router();
const autorRoutes = require("./Autor.js");
const generoRoutes = require("./Genero.js");
const temaPrincipalRoutes = require("./TemaPrincipal.js");
const categoriaRoutes = require("./Categoria.js");
const statusEdicaoRoutes = require("./StatusEdicao.js");
const statusComentarioRoutes = require("./StatusComentario.js");
const edicaoRoutes = require("./Edicao.js");
const publicacaoRoutes = require("./Publicacao.js");
const comentarioRoutes = require("./Comentario.js");
const publicacaoCategoriaRoutes = require("./PublicacaoCategoria.js");

router.use("/autores", autorRoutes);
router.use("/generos", generoRoutes);
router.use("/temas-principais", temaPrincipalRoutes);
router.use("/categorias", categoriaRoutes);
router.use("/status-edicao", statusEdicaoRoutes);
router.use("/status-comentario", statusComentarioRoutes);
router.use("/edicoes", edicaoRoutes);
router.use("/publicacoes", publicacaoRoutes);
router.use("/comentarios", comentarioRoutes);
router.use("/publicacoes-categorias", publicacaoCategoriaRoutes);

module.exports = router;
