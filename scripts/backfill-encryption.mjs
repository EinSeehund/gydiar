// One-time backfill: encrypts existing tasks.title / categories.name /
// projects.name / projects.description, and replaces the old
// slugify(name)-derived categories.slug / projects.slug (which would
// otherwise leak the plaintext name right next to its encrypted column)
// with a random opaque token.
//
// Run after migrations/002_add_field_encryption.sql and before
// migrations/003_enforce_name_hash.sql:
//
//   DATABASE_URL=... ENCRYPTION_MASTER_KEY=... node scripts/backfill-encryption.mjs
//
// Plain Node + pg + crypto only (no ts-node/tsx), so it can't import
// src/lib/crypto.ts directly; the same AES-256-GCM/HMAC logic is
// duplicated here. Not designed to be re-run against rows it has already
// migrated.

import crypto from "crypto";
import pg from "pg";

const { Pool } = pg;

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getMasterKey() {
    const key = process.env.ENCRYPTION_MASTER_KEY;
    if (!key || !/^[0-9a-f]{64}$/i.test(key)) {
        throw new Error(
            "ENCRYPTION_MASTER_KEY must be set to 64 hex characters (32 bytes)",
        );
    }
    return Buffer.from(key, "hex");
}

function encryptBuffer(plaintext, key) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, ciphertext, authTag]).toString("base64");
}

function decryptBuffer(stored, key) {
    const data = Buffer.from(stored, "base64");
    const iv = data.subarray(0, IV_LENGTH);
    const authTag = data.subarray(data.length - AUTH_TAG_LENGTH);
    const ciphertext = data.subarray(IV_LENGTH, data.length - AUTH_TAG_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

function wrapDataKey(dataKey, masterKey) {
    return encryptBuffer(dataKey, masterKey);
}

function unwrapDataKey(wrapped, masterKey) {
    return decryptBuffer(wrapped, masterKey);
}

function encryptField(plaintext, dataKey) {
    return encryptBuffer(Buffer.from(plaintext, "utf8"), dataKey);
}

function hashField(plaintext, dataKey) {
    const normalized = plaintext.trim().toLowerCase().replace(/\s+/g, " ");
    return crypto.createHmac("sha256", dataKey).update(normalized).digest("hex");
}

function generateSlug() {
    return crypto.randomBytes(9).toString("base64url");
}

async function getOrCreateDataKey(pool, masterKey, userId, cache) {
    if (cache.has(userId)) return cache.get(userId);

    const existing = await pool.query(
        `SELECT wrapped_key FROM user_encryption_keys WHERE user_id = $1`,
        [userId],
    );
    let dataKey;
    if (existing.rowCount === 1) {
        dataKey = unwrapDataKey(existing.rows[0].wrapped_key, masterKey);
    } else {
        dataKey = crypto.randomBytes(32);
        await pool.query(
            `INSERT INTO user_encryption_keys (user_id, wrapped_key) VALUES ($1, $2)`,
            [userId, wrapDataKey(dataKey, masterKey)],
        );
    }
    cache.set(userId, dataKey);
    return dataKey;
}

async function backfillTasks(pool, masterKey, cache) {
    const { rows } = await pool.query("SELECT id, user_id, title FROM tasks");
    for (const row of rows) {
        const dataKey = await getOrCreateDataKey(pool, masterKey, row.user_id, cache);
        await pool.query("UPDATE tasks SET title = $1 WHERE id = $2", [
            encryptField(row.title, dataKey),
            row.id,
        ]);
    }
    console.log(`tasks: encrypted ${rows.length} row(s)`);
}

async function backfillCategories(pool, masterKey, cache) {
    const { rows } = await pool.query(
        "SELECT id, user_id, name FROM categories",
    );
    for (const row of rows) {
        const dataKey = await getOrCreateDataKey(pool, masterKey, row.user_id, cache);
        await pool.query(
            `UPDATE categories SET name = $1, name_hash = $2, slug = $3 WHERE id = $4`,
            [
                encryptField(row.name, dataKey),
                hashField(row.name, dataKey),
                generateSlug(),
                row.id,
            ],
        );
    }
    console.log(`categories: encrypted ${rows.length} row(s)`);
}

async function backfillProjects(pool, masterKey, cache) {
    const { rows } = await pool.query(
        "SELECT id, user_id, name, description FROM projects",
    );
    for (const row of rows) {
        const dataKey = await getOrCreateDataKey(pool, masterKey, row.user_id, cache);
        await pool.query(
            `UPDATE projects SET name = $1, description = $2, name_hash = $3, slug = $4 WHERE id = $5`,
            [
                encryptField(row.name, dataKey),
                row.description === null ? null : encryptField(row.description, dataKey),
                hashField(row.name, dataKey),
                generateSlug(),
                row.id,
            ],
        );
    }
    console.log(`projects: encrypted ${rows.length} row(s)`);
}

async function main() {
    const masterKey = getMasterKey();
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const dataKeyCache = new Map();

    try {
        await backfillTasks(pool, masterKey, dataKeyCache);
        await backfillCategories(pool, masterKey, dataKeyCache);
        await backfillProjects(pool, masterKey, dataKeyCache);
        console.log(
            "Done. Now apply migrations/003_enforce_name_hash.sql.",
        );
    } finally {
        await pool.end();
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
