const pool = require("./database.js");
const { gerarHash, ADMIN_EMAILS } = require("../utils/authHelper.js");

const ADMIN_USERS = [
  {
    nome: "Lucas Sola",
    email: "lucas.sola@portalsesisp.org.br",
    serie_escolar: "3ºB",
    descricao: "Administrador do Jornal SESI",
    cargo: "admin",
  },
  {
    nome: "Enzo Antonio",
    email: "enzo.antonio@portalsesisp.org.br",
    serie_escolar: "3ºB",
    descricao: "Administrador do Jornal SESI",
    cargo: "admin",
  },
  {
    nome: "Rafael Teixeira",
    email: "rafael.teixeira@portalsesisp.org.br",
    serie_escolar: "3ºB",
    descricao: "Administrador do Jornal SESI",
    cargo: "admin",
  },
  {
    nome: "Rafael Ferreira",
    email: "rafael.ferreira@portalsesisp.org.br",
    serie_escolar: "3ºB",
    descricao: "Administrador do Jornal SESI",
    cargo: "admin",
  },
];

async function inicializarAutenticacaoEAdmins() {
  try {
    // 1. Migração de Colunas na tabela autor
    try {
      await pool.query("ALTER TABLE autor ADD COLUMN senha VARCHAR(255) NULL");
      console.log("Coluna 'senha' adicionada com sucesso na tabela autor! 🔑");
    } catch (err) {
      if (err.code !== "ER_DUP_COLUMN_NAME" && err.errno !== 1060 && !err.message.includes("Duplicate column")) {
        console.error("Aviso coluna 'senha':", err.message);
      }
    }

    try {
      await pool.query("ALTER TABLE autor ADD COLUMN cargo VARCHAR(20) NOT NULL DEFAULT 'autor'");
      console.log("Coluna 'cargo' adicionada com sucesso na tabela autor! 🛡️");
    } catch (err) {
      if (err.code !== "ER_DUP_COLUMN_NAME" && err.errno !== 1060 && !err.message.includes("Duplicate column")) {
        console.error("Aviso coluna 'cargo':", err.message);
      }
    }

    const defaultPasswordHash = await gerarHash("Sesi@125");
    const adminPasswordHash = await gerarHash("admin_key_123");

    // 2. Definir senha padrão para autores (não-admins) que estiverem com senha nula
    await pool.query(
      "UPDATE autor SET senha = ? WHERE (senha IS NULL OR senha = '') AND cargo != 'admin'",
      [defaultPasswordHash]
    );

    // Definir senha padrão para admins que estiverem com senha nula
    await pool.query(
      "UPDATE autor SET senha = ? WHERE (senha IS NULL OR senha = '') AND cargo = 'admin'",
      [adminPasswordHash]
    );

    // 3. Cadastrar ou atualizar os administradores solicitados
    const placeholders = ADMIN_EMAILS.map(() => '?').join(', ');
    await pool.query(
      `UPDATE autor SET cargo = 'autor' WHERE cargo = 'admin' AND LOWER(email) NOT IN (${placeholders})`,
      ADMIN_EMAILS.map((email) => email.toLowerCase())
    );
    for (const admin of ADMIN_USERS) {
      const [rows] = await pool.query(
        "SELECT id, cargo, senha FROM autor WHERE LOWER(email) = LOWER(?)",
        [admin.email]
      );

      if (rows.length === 0) {
        await pool.query(
          "INSERT INTO autor (nome, email, serie_escolar, descricao, senha, cargo, ativo) VALUES (?, ?, ?, ?, ?, 'admin', 1)",
          [admin.nome, admin.email, admin.serie_escolar, admin.descricao, adminPasswordHash]
        );
        console.log(`Administrador inserido: ${admin.nome} (${admin.email})`);
      } else {
        await pool.query(
          "UPDATE autor SET cargo = 'admin' WHERE id = ?",
          [rows[0].id]
        );
      }
    }

    console.log("Sistema de Autenticação JWT e Administradores inicializado com sucesso! ✅");
  } catch (err) {
    console.error("Erro ao inicializar autenticação e administradores:", err.message);
  }
}

module.exports = {
  inicializarAutenticacaoEAdmins,
  ADMIN_USERS,
};
