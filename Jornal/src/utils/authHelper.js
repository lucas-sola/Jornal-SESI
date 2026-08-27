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

function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === email.trim().toLowerCase());
}

module.exports = {
  gerarHash,
  compararHash,
  gerarTokenJWT,
  verificarTokenJWT,
  isAdminEmail,
  ADMIN_EMAILS,
};
