import { Request, Response } from 'express';
import { generateAccessToken } from '../utils/jwt';
import jwt, { JwtPayload } from 'jsonwebtoken';

  // Refresh Token Route
  export const handleRefreshToken = async (req: Request, res: Response) => {
    try {
      const cookies = req.cookies;
      
      // Check if the refresh token exists in the cookies
      if (!cookies?.jwt) {
        console.error('Refresh token not found in cookies');
        return res.status(401).json({ error: 'Unauthorized access' }); // Unauthorized - no refresh token found
      }
  
      const refreshToken = cookies.jwt;
  
      // Verify the refresh token
      const decoded = await verifyRefreshToken(refreshToken);
  
      // If verification fails, return forbidden status
      if (!decoded) {
        console.error('Invalid or expired refresh token');
        return res.sendStatus(403); // Forbidden - invalid or expired token
      }
  
      // If the token is valid, issue a new access token
      const accessToken = generateAccessToken(decoded.userId);
  
      // Return the new access token in the response
      return res.json({ accessToken });
    } catch (error) {
      // If headers are not already sent, respond with a 500 error
      if (!res.headersSent) {
        return res.status(500).send('Internal server error');
      }
    }
  };
  
  // Utility function to verify the refresh token 
  export const verifyRefreshToken = (token: string): Promise<JwtPayload | null> => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET as string, (err, decoded) => {
        if (err) {
          return reject(null); // If the token is invalid or expired, return null
        }
        resolve(decoded as JwtPayload);
      });
    });
  };