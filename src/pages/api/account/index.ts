import type { NextApiRequest, NextApiResponse } from "next";
import { requireUser } from "@/lib/session";
import { getAccountInfo } from "@/lib/account";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const user = await requireUser(req, res);
    if (!user) return;

    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res
            .status(405)
            .json({ success: false, error: "Method not allowed" });
    }

    try {
        const account = await getAccountInfo(user.id);
        if (!account) {
            return res
                .status(404)
                .json({ success: false, error: "Account not found" });
        }
        return res.status(200).json({ success: true, account });
    } catch (error) {
        console.error("DB error:", error);
        return res
            .status(500)
            .json({ success: false, error: "Internal server error" });
    }
}
