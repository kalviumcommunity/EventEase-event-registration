import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { env } from './env';

const JWT_SECRET = env.JWT_SECRET!;

export function signToken(payload: { userId: string; email: string; role: string }, expiresIn: string = '1h'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

/**
 * Verifies a JWT token and extracts payload.
 * @param token - JWT token string
 * @returns Decoded payload or throws error if invalid/expired
 */
export function verifyToken(token: string): { userId: string; email: string; role: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { userId: string; email: string; role: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Hashes a password using bcrypt.
 * Why passwords must be hashed: Plain text passwords are vulnerable to breaches.
 * Bcrypt adds salt and computational cost, making brute-force attacks impractical.
 * @param password - Plain text password
 * @param saltRounds - Salt rounds (default: 10)
 * @returns Hashed password string
 */
export async function hashPassword(password: string, saltRounds: number = 10): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compares a plain text password with a hashed password.
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match, false otherwise
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}