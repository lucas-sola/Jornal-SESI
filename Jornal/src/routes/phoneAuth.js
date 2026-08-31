const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/database.js"); // Troque por seu ORM/pg se a interface do banco for diferente.
const { verificarAuth } = require("../middlewares/verificarAuth.js");
const { sendVerification, checkVerification } = require("../services/twilioVerify.js");

const router = express.Router();
const E164 = /^\+[1-9]\d{7,14}$/;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const attempts = new Map();
const genericRequestResponse = {
  sucesso: true,
  mensagem: "Se o telefone estiver cadastrado e verificado, você receberá um código.",
};

function rateLimit(req, res, next) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const recent = (attempts.get(key) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    return res.status(429).json({ sucesso: false, erro: "Muitas tentativas. Tente novamente mais tarde." });
  }
  recent.push(now);
  attempts.set(key, recent);
  next();
}

function phoneFrom(body) { return typeof body.phone === "string" ? body.phone.trim() : ""; }

router.post("/phone/start-verification", rateLimit, verificarAuth, async (req, res) => {
  const phone = phoneFrom(req.body);
  if (!E164.test(phone)) return res.status(400).json({ sucesso: false, erro: "Telefone deve estar no formato E.164." });
  try {
    const [conflict] = await db.query("SELECT id FROM autor WHERE phone = ? AND phone_verified = 1 AND id <> ? LIMIT 1", [phone, req.autorId]);
    if (conflict.length) return res.status(409).json({ sucesso: false, erro: "Este telefone já está verificado em outra conta." });
    await db.query("UPDATE autor SET phone = ?, phone_verified = 0 WHERE id = ?", [phone, req.autorId]);
    await sendVerification(phone);
    res.json({ sucesso: true, mensagem: "Código de verificação enviado." });
  } catch (error) {
    console.error("Erro ao iniciar verificação por telefone:", error);
    res.status(500).json({ sucesso: false, erro: "Não foi possível enviar o código." });
  }
});

router.post("/phone/confirm-verification", rateLimit, verificarAuth, async (req, res) => {
  const phone = phoneFrom(req.body);
  const code = typeof req.body.code === "string" ? req.body.code.trim() : "";
  if (!E164.test(phone) || !/^\d{4,10}$/.test(code)) return res.status(400).json({ sucesso: false, erro: "Telefone ou código inválido." });
  try {
    const result = await checkVerification(phone, code);
    if (result.status !== "approved") return res.status(400).json({ sucesso: false, erro: "Código inválido ou expirado." });
    const [conflict] = await db.query("SELECT id FROM autor WHERE phone = ? AND phone_verified = 1 AND id <> ? LIMIT 1", [phone, req.autorId]);
    if (conflict.length) return res.status(409).json({ sucesso: false, erro: "Este telefone já está verificado em outra conta." });
    await db.query("UPDATE autor SET phone = ?, phone_verified = 1 WHERE id = ?", [phone, req.autorId]);
    res.json({ sucesso: true, mensagem: "Telefone verificado com sucesso." });
  } catch (error) {
    console.error("Erro ao confirmar telefone:", error);
    res.status(500).json({ sucesso: false, erro: "Não foi possível verificar o telefone." });
  }
});

router.post("/password-reset/phone/request", rateLimit, async (req, res) => {
  const phone = phoneFrom(req.body);
  if (!E164.test(phone)) return res.json(genericRequestResponse);
  try {
    const [rows] = await db.query("SELECT id FROM autor WHERE phone = ? AND phone_verified = 1 LIMIT 1", [phone]);
    if (rows.length) await sendVerification(phone);
  } catch (error) { console.error("Erro ao solicitar recuperação por telefone:", error); }
  res.json(genericRequestResponse);
});

router.post("/password-reset/phone/confirm", rateLimit, async (req, res) => {
  const phone = phoneFrom(req.body);
  const code = typeof req.body.code === "string" ? req.body.code.trim() : "";
  const password = typeof req.body.newPassword === "string" ? req.body.newPassword : "";
  if (!E164.test(phone) || !/^\d{4,10}$/.test(code) || password.length < 8) return res.status(400).json({ sucesso: false, erro: "Dados de recuperação inválidos." });
  try {
    const result = await checkVerification(phone, code);
    if (result.status !== "approved") return res.status(400).json({ sucesso: false, erro: "Código inválido ou expirado." });
    const hash = await bcrypt.hash(password, 12);
    const [updated] = await db.query("UPDATE autor SET senha = ? WHERE phone = ? AND phone_verified = 1", [hash, phone]);
    if (!updated.affectedRows) return res.status(400).json({ sucesso: false, erro: "Não foi possível redefinir a senha." });
    res.json({ sucesso: true, mensagem: "Senha redefinida com sucesso." });
  } catch (error) {
    console.error("Erro ao confirmar recuperação por telefone:", error);
    res.status(500).json({ sucesso: false, erro: "Não foi possível redefinir a senha." });
  }
});

module.exports = router;
