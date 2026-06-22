const autorService = require("../services/AutorService.js");

async function verificarAutor(req, res, next) {
  try {
    const usuarioId = req.headers["x-usuario-id"];

    if (!usuarioId) {
      return res.status(403).json({
        sucesso: false,
        erro: "Acesso restrito a autores cadastrados. Faça login com seu e-mail.",
      });
    }

    const resultado = await autorService.buscarAutor(usuarioId, true);
    const autor = resultado.dados;

    if (!resultado.sucesso || !autor || !autor.email) {
      return res.status(403).json({
        sucesso: false,
        erro: "E-mail não encontrado no cadastro de autores.",
      });
    }

    req.autorId = Number(usuarioId);
    req.autor = autor;
    next();
  } catch {
    return res.status(403).json({
      sucesso: false,
      erro: "Acesso negado. Apenas autores cadastrados podem publicar.",
    });
  }
}

module.exports = verificarAutor;
