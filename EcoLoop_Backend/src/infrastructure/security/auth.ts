import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
const JWT_SECRET = process.env.JWT_SECRET || "ecoloop_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export type JWTPayload = {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
};

declare module "express" {
  export interface Request {
    user?: JWTPayload | null;
  }
}

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Token utilities
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (err) {
    return null;
  }
};

export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
    return parts[1];
  }
  return null;
};

// Middlewares
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"] as string | undefined;
    // @ts-ignore
    const token = extractTokenFromHeader(authHeader) || (req.cookies && req.cookies.token);
    if (!token) {
      req.user = null;
      return res.status(401).json({ error: "No token provided" });
    }

    const payload = verifyToken(token);
    if (!payload) {
      req.user = null;
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = payload;
    return next();
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: "No autenticado" });
  if (req.user.role !== "admin") return res.status(403).json({ error: "Requiere rol admin" });
  return next();
};

export const workerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: "No autenticado" });
  if (req.user.role !== "worker" && req.user.role !== "admin") {
    return res.status(403).json({ error: "Requiere rol worker o admin" });
  }
  return next();
};
