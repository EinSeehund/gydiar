-- One row per user: that user's AES-256 data key, wrapped (encrypted) by
-- ENCRYPTION_MASTER_KEY. Kept in its own table rather than inside
-- better-auth's managed user/account/session/verification tables.
CREATE TABLE user_encryption_keys (
  user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  wrapped_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ciphertext is longer than the plaintext varchar limits. Plaintext length
-- is still enforced in src/lib/validation.ts before encryption, so this is
-- a storage-width change only.
ALTER TABLE categories ALTER COLUMN name TYPE text;
ALTER TABLE projects ALTER COLUMN name TYPE text;
ALTER TABLE projects ALTER COLUMN description TYPE text;

-- Nullable until scripts/backfill-encryption.js has populated it for
-- existing rows; see migrations/003_enforce_name_hash.sql.
ALTER TABLE categories ADD COLUMN name_hash text;
ALTER TABLE projects ADD COLUMN name_hash text;

-- Relied on name being plaintext to detect duplicates. Once name holds
-- ciphertext with a random IV per row, equal plaintexts never produce
-- equal ciphertext, so this stops catching duplicates instead of just
-- becoming redundant with name_hash. There's no equivalent constraint on
-- projects today, so nothing to drop there.
ALTER TABLE categories DROP CONSTRAINT categories_user_id_name_key;
