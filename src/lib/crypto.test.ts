import { beforeAll, describe, expect, it } from "vitest";
import {
    decryptField,
    encryptField,
    generateDataKey,
    generateSlug,
    hashField,
    unwrapDataKey,
    wrapDataKey,
} from "./crypto";

beforeAll(() => {
    process.env.ENCRYPTION_MASTER_KEY =
        "0".repeat(63) + "1"; // 64 hex chars
});

describe("encryptField / decryptField", () => {
    it("round-trips plaintext through a data key", () => {
        const dataKey = generateDataKey();
        const stored = encryptField("Buy milk", dataKey);
        expect(decryptField(stored, dataKey)).toBe("Buy milk");
    });

    it("produces different ciphertext for the same plaintext each time", () => {
        const dataKey = generateDataKey();
        expect(encryptField("Buy milk", dataKey)).not.toBe(
            encryptField("Buy milk", dataKey),
        );
    });

    it("fails to decrypt with the wrong data key", () => {
        const stored = encryptField("Buy milk", generateDataKey());
        expect(() => decryptField(stored, generateDataKey())).toThrow();
    });
});

describe("wrapDataKey / unwrapDataKey", () => {
    it("round-trips a data key through the master key", () => {
        const dataKey = generateDataKey();
        const wrapped = wrapDataKey(dataKey);
        expect(unwrapDataKey(wrapped)).toEqual(dataKey);
    });
});

describe("hashField", () => {
    it("is deterministic for the same plaintext and data key", () => {
        const dataKey = generateDataKey();
        expect(hashField("Work Stuff", dataKey)).toBe(
            hashField("Work Stuff", dataKey),
        );
    });

    it("normalizes case and surrounding/repeated whitespace", () => {
        const dataKey = generateDataKey();
        expect(hashField("  Work   Stuff  ", dataKey)).toBe(
            hashField("work stuff", dataKey),
        );
    });

    it("differs for different data keys, even with the same plaintext", () => {
        expect(hashField("Work Stuff", generateDataKey())).not.toBe(
            hashField("Work Stuff", generateDataKey()),
        );
    });

    it("differs for different plaintext", () => {
        const dataKey = generateDataKey();
        expect(hashField("Work Stuff", dataKey)).not.toBe(
            hashField("Home Stuff", dataKey),
        );
    });
});

describe("generateSlug", () => {
    it("returns a URL-safe string unrelated to any input", () => {
        expect(generateSlug()).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it("is different on every call", () => {
        expect(generateSlug()).not.toBe(generateSlug());
    });
});
