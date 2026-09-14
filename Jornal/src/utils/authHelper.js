const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
require("dotenv").config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não configurado no arquivo .env");
  }
  return secret;
}

function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || "7d";
}

const ADMIN_EMAILS = [
  "lucas.sola@portalsesisp.org.br",
  "enzo.antonio@portalsesisp.org.br",
  "rafael.teixeira@portalsesisp.org.br",
  "rafael.ferreira@portalsesisp.org.br"
];

async function gerarHash(senha) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(senha, salt);
}

async function compararHash(senha, hash) {
  if (!senha || !hash) return false;
  return bcrypt.compare(senha, hash);
}

function gerarTokenJWT(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: getJwtExpiresIn() });
}

function verificarTokenJWT(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}

// Domínios dos e-mails oficiais pré-cadastrados no banco (autores do jornal).
// Contas criadas com e-mails fora desses domínios podem interagir (curtir,
// comentar), mas não podem publicar nem alterar publicações.
const DOMINIOS_OFICIAIS = [
  "@portalsesisp.org.br",
  "@senaisp.edu.br"
];

function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === email.trim().toLowerCase());
}

/**
 * Verifica se o e-mail pertence a um autor oficial do jornal
 * (domínio institucional pré-cadastrado no banco de dados).
 * @param {string} email
 * @returns {boolean}
 */
function podePublicarPorEmail(email) {
  if (!email) return false;
  const emailLimpo = String(email).trim().toLowerCase();
  return DOMINIOS_OFICIAIS.some((dominio) => emailLimpo.endsWith(dominio));
}

module.exports = {
  gerarHash,
  compararHash,
  gerarTokenJWT,
  verificarTokenJWT,
  isAdminEmail,
  podePublicarPorEmail,
  ADMIN_EMAILS,
};
