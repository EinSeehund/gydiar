import type { NextApiRequest, NextApiResponse } from "next";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth";

export async function requireUser(req: NextApiRequest, res: NextApiResponse) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return null;
  }

  return session.user;
}