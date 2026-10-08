import type { NextApiRequest, NextApiResponse } from "next";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/lib/auth";
import { requireUser } from "@/lib/session";
import { getAccountInfo } from "@/lib/account";

const MIN_PASSWORD_LENGTH = 8;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const user = await requireUser(req, res);
    if (!user) return;

    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res
            .status(405)
            .json({ success: false, error: "Method not allowed" });
    }

    const newPassword = req.body?.newPassword;
    if (
        typeof newPassword !== "string" ||
        newPassword.length < MIN_PASSWORD_LENGTH
    ) {
        return res.status(400).json({
            success: false,
            error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
        });
    }

    try {
        const account = await getAccountInfo(user.id);
        if (account?.has_password) {
            return res
                .status(400)
                .json({ success: false, error: "You already have a password" });
        }

        await auth.api.setPassword({
            body: { newPassword },
            headers: fromNodeHeaders(req.headers),
        });
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Set password error:", error);
        return res
            .status(500)
            .json({ success: false, error: "Could not set password" });
    }
}
