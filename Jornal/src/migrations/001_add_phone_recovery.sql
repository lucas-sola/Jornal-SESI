-- A tabela de usuários deste projeto chama-se `autor` (equivalente a `users`).
ALTER TABLE autor
  ADD COLUMN phone VARCHAR(20) NULL UNIQUE,
  ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT FALSE;
