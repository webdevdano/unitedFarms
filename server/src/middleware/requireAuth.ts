import type { Request, Response, NextFunction } from "express";
import { getToken } from "next-auth/jwt";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Server auth misconfigured (missing NEXTAUTH_SECRET)" });
  }

  const token = await getToken({ req: req as any, secret });
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  (req as any).auth = token;
  next();
}
