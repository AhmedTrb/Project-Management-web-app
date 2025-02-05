import jwt, { JwtPayload } from 'jsonwebtoken';


const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET ;
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET ;
const development = process.env.STATUS === 'development'; ;
// Generate Access Token
export const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_ACCESS_TOKEN_SECRET as string, { expiresIn: '4h' });
};

// Generate Refresh Token 
export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' });
};

// Verify Access Token
export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_ACCESS_TOKEN_SECRET as string) as JwtPayload;
  } catch (error) {
    return null;
  }
};

// Verify Refresh Token
export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_TOKEN_SECRET as string) as JwtPayload;
  } catch (error) {
    return null;
  }
};
