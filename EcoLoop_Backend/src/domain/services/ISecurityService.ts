export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface ISecurityService {
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  generateToken(payload: JWTPayload): string;
}
