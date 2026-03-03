import type { Request, Response, NextFunction } from "express";
import { getToken } from "next-auth/jwt";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Server auth misconfigured (missing NEXTAUTH_SECRET)" });
  }

  type GetTokenArgs = Parameters<typeof getToken>[0];
  const token = await getToken({ req: req as unknown as GetTokenArgs["req"], secret });
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  (req as unknown as { auth: unknown }).auth = token;
  next();
}
