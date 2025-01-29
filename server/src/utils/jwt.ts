import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET ;
const JWT_EXPIRATION = '7d';

export const generateToken = (user: User) => {
  return jwt.sign(
    { 
      userId: user.userId, 
      email: user.email 
    }, 
    JWT_SECRET as string, 
    { expiresIn: JWT_EXPIRATION }
  );
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
