-- ============================================================================
-- MIGRATION: Coluna pode_publicar na tabela autor
-- Autores oficiais (e-mails @portalsesisp.org.br / @senaisp.edu.br) → 1
-- Contas criadas com e-mail externo (ex: gmail) → 0 (só interagem: curtir,
-- comentar; não publicam nem alteram publicações)
--
-- Execute no MySQL/phpMyAdmin ou via terminal:
--   mysql -u root -p db_jornal_sesi < src/migrations/003_add_pode_publicar.sql
-- ============================================================================

USE db_jornal_sesi;

-- 1. Adiciona a coluna (padrão: não pode publicar)
ALTER TABLE autor
    ADD COLUMN pode_publicar BOOLEAN NOT NULL DEFAULT 0 AFTER cargo;

-- 2. Autores oficiais: e-mails institucionais pré-cadastrados no banco
UPDATE autor
SET pode_publicar = 1
WHERE email LIKE '%@portalsesisp.org.br'
   OR email LIKE '%@senaisp.edu.br';

-- 3. Admins sempre podem publicar
UPDATE autor
SET pode_publicar = 1
WHERE cargo = 'admin';

-- Verificação (opcional)
SELECT cargo, pode_publicar, COUNT(*) AS total
FROM autor
GROUP BY cargo, pode_publicar;
