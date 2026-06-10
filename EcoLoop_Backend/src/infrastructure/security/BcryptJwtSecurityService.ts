import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ISecurityService, JWTPayload } from "../../domain/services/ISecurityService";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
const JWT_SECRET = process.env.JWT_SECRET || "ecoloop_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export class BcryptJwtSecurityService implements ISecurityService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
  }
}

export const bcryptJwtSecurityService = new BcryptJwtSecurityService();
export default bcryptJwtSecurityService;
