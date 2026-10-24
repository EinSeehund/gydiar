-- Run after scripts/backfill-encryption.js has populated name_hash for
-- every existing categories/projects row.
ALTER TABLE categories ALTER COLUMN name_hash SET NOT NULL;
ALTER TABLE projects ALTER COLUMN name_hash SET NOT NULL;

CREATE UNIQUE INDEX categories_user_id_name_hash_key ON categories (user_id, name_hash);
CREATE UNIQUE INDEX projects_user_id_name_hash_key ON projects (user_id, name_hash);
