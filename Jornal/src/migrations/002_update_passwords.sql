-- ============================================================================
-- MIGRATION: Atualizar senhas de todos os autores e admins
-- Autores  → Sesi@125     (hash bcrypt)
-- Admins   → admin_key_123 (hash bcrypt)
-- Execute no MySQL/phpMyAdmin ou via terminal:
--   mysql -u root -p db_jornal_sesi < src/migrations/002_update_passwords.sql
-- ============================================================================

USE db_jornal_sesi;

-- 1. Atualiza todos os autores (não-admins) para Sesi@125
UPDATE autor
SET senha = '$2b$10$i3FA5/CEU8JMPO3asjoLeOuQbyn67AH0y6RbFTmrePFFSYMUKAMLK'
WHERE cargo != 'admin';

-- 2. Atualiza todos os admins para admin_key_123
UPDATE autor
SET senha = '$2b$10$TV5.nSyUsgLJK/TYoBMuPeYsF0nKZFYsm7qyYGHZkW/bltZGuvAA.'
WHERE cargo = 'admin';

-- Verificação (opcional — mostra quantas linhas foram afetadas por cargo)
SELECT cargo, COUNT(*) AS total FROM autor GROUP BY cargo;
