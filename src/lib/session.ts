import type { NextApiRequest, NextApiResponse } from "next";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth";
import type { GetServerSideProps } from "next";

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

export const redirectIfAuthenticated: GetServerSideProps = async ({ req }) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (session) {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: {} };
};