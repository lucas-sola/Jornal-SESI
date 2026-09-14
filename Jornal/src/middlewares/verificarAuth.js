const { verificarTokenJWT } = require("../utils/authHelper.js");
const autorRepository = require("../repositories/AutorRepository.js");

async function verificarAuth(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.headers["x-access-token"]) {
      token = req.headers["x-access-token"];
    }

    if (token) {
      const decoded = verificarTokenJWT(token);
      if (!decoded) {
        return res.status(401).json({
          sucesso: false,
          erro: "Token JWT inválido ou expirado. Faça login novamente.",
        });
      }

      req.usuario = decoded;
      req.autorId = Number(decoded.id);
      req.autor = decoded;
      return next();
    }

    // Suporte retrocompatível para x-usuario-id se token não for enviado
    const usuarioId = req.headers["x-usuario-id"];
    if (usuarioId) {
      const autor = await autorRepository.buscarAutor(usuarioId);
      if (autor) {
        req.usuario = {
          id: autor.id,
          nome: autor.nome,
          email: autor.email,
          cargo: autor.cargo || "autor",
        };
        req.autorId = Number(usuarioId);
        req.autor = autor;
        return next();
      }
    }

    return res.status(401).json({
      sucesso: false,
      erro: "Acesso não autorizado. Token JWT não fornecido.",
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      erro: "Erro interno na autenticação.",
    });
  }
}

function verificarAdmin(req, res, next) {
  if (!req.usuario || req.usuario.cargo !== "admin") {
    return res.status(403).json({
      sucesso: false,
      erro: "Acesso negado. Apenas administradores possuem esta permissão.",
    });
  }
  next();
}

/**
 * Permite publicar apenas para autores oficiais do jornal (e-mail com domínio
 * institucional pré-cadastrado no banco) e administradores. Contas criadas com
 * e-mails externos podem interagir (curtir, comentar), mas não publicar.
 */
function verificarPodePublicar(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({
      sucesso: false,
      erro: "Acesso não autorizado. Faça login para publicar.",
    });
  }

  if (req.usuario.cargo === "admin" || req.usuario.pode_publicar === 1 || req.usuario.pode_publicar === true) {
    return next();
  }

  return res.status(403).json({
    sucesso: false,
    erro: "Apenas autores oficiais do jornal podem publicar matérias.",
  });
}

// Para operações sensíveis, como troca de senha, não aceita o cabeçalho
// legado X-Usuario-Id: é obrigatório apresentar um JWT válido.
function verificarTokenJWTObrigatorio(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({
      sucesso: false,
      erro: "Acesso não autorizado. Faça login novamente.",
    });
  }

  const decoded = verificarTokenJWT(token);
  if (!decoded) {
    return res.status(401).json({
      sucesso: false,
      erro: "Token JWT inválido ou expirado. Faça login novamente.",
    });
  }

  req.usuario = decoded;
  req.autorId = Number(decoded.id);
  req.autor = decoded;
  next();
}

module.exports = {
  verificarAuth,
  verificarTokenJWTObrigatorio,
  verificarAdmin,
  verificarPodePublicar,
};
