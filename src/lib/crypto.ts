import crypto from "crypto";
import pool from "./db";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getMasterKey(): Buffer {
    const key = process.env.ENCRYPTION_MASTER_KEY;
    if (!key || !/^[0-9a-f]{64}$/i.test(key)) {
        throw new Error(
            "ENCRYPTION_MASTER_KEY must be set to 64 hex characters (32 bytes)",
        );
    }
    return Buffer.from(key, "hex");
}

// base64(iv || ciphertext || authTag), a single text-safe string.
function encryptBuffer(plaintext: Buffer, key: Buffer): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, ciphertext, authTag]).toString("base64");
}

function decryptBuffer(stored: string, key: Buffer): Buffer {
    const data = Buffer.from(stored, "base64");
    const iv = data.subarray(0, IV_LENGTH);
    const authTag = data.subarray(data.length - AUTH_TAG_LENGTH);
    const ciphertext = data.subarray(IV_LENGTH, data.length - AUTH_TAG_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

export function generateDataKey(): Buffer {
    return crypto.randomBytes(32);
}

export function wrapDataKey(dataKey: Buffer): string {
    return encryptBuffer(dataKey, getMasterKey());
}

export function unwrapDataKey(wrapped: string): Buffer {
    return decryptBuffer(wrapped, getMasterKey());
}

/**
 * Returns the user's data key, creating and persisting one (wrapped under
 * the master key) on first use. The ON CONFLICT DO NOTHING + re-SELECT
 * resolves the race between two concurrent requests from the same user
 * both finding no key yet.
 */
export async function getOrCreateDataKey(userId: string): Promise<Buffer> {
    const existing = await pool.query(
        `SELECT wrapped_key FROM user_encryption_keys WHERE user_id = $1`,
        [userId],
    );
    if (existing.rowCount === 1) {
        return unwrapDataKey(existing.rows[0].wrapped_key);
    }

    await pool.query(
        `INSERT INTO user_encryption_keys (user_id, wrapped_key)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId, wrapDataKey(generateDataKey())],
    );

    const result = await pool.query(
        `SELECT wrapped_key FROM user_encryption_keys WHERE user_id = $1`,
        [userId],
    );
    return unwrapDataKey(result.rows[0].wrapped_key);
}

export function encryptField(plaintext: string, dataKey: Buffer): string {
    return encryptBuffer(Buffer.from(plaintext, "utf8"), dataKey);
}

export function decryptField(stored: string, dataKey: Buffer): string {
    return decryptBuffer(stored, dataKey).toString("utf8");
}

/**
 * Deterministic per-user fingerprint of a name, used to detect duplicate
 * category/project names without storing the name itself in a comparable
 * form. Normalization mirrors what slugify used to collapse (case,
 * surrounding/repeated whitespace) so duplicate detection doesn't regress.
 */
export function hashField(plaintext: string, dataKey: Buffer): string {
    const normalized = plaintext.trim().toLowerCase().replace(/\s+/g, " ");
    return crypto.createHmac("sha256", dataKey).update(normalized).digest("hex");
}

// Opaque per-row identifier for categories/projects, used in URLs/filters.
// Deliberately unrelated to the (now encrypted) name.
export function generateSlug(): string {
    return crypto.randomBytes(9).toString("base64url");
}
