import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  generateAccessToken,
  verifyAccessToken, 
} from '../utils/jwt';
import { 
  hashPassword, 
  comparePassword 
} from '../utils/password';
import { 
  authenticateGoogleToken 
} from '../utils/google-auth';

const prisma = new PrismaClient();

export const googleSignup = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    // Verify Google token
    const googleUser = await authenticateGoogleToken(token);

    // Check if user exists
    let user = await prisma.user.findUnique({ 
      where: { email: googleUser.email } 
    });

    // If not, create new user
    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: googleUser.googleId,
          email: googleUser.email,
          username: googleUser.name || googleUser.email.split('@')[0],
        }
      });
    }

    // Generate JWT
    const authToken = generateAccessToken(user.userId.toString());

    res.status(200).json({ 
      user: { 
        id: user.userId, 
        username: user.username, 
        email: user.email 
      }, 
      token: authToken 
    });
  } catch (error) {
    res.status(500).json({ error: 'Google authentication failed' });
  }
};

export const getAuthenticatedUser = async (req: Request, res: Response) => {
  try {
    // Extract token from HTTP-only cookie
    const token = req.cookies?.jwt; 

    if (!token) return res.status(401).json({ message: "No token provided" });
    
    // Verify the token
    const decoded = verifyAccessToken(token);
    if (!decoded?.userId) return res.status(401).json({ message: "Unauthorized" });
    
    // Fetch user from database
    const foundUser = await prisma.user.findUnique({
      where: { userId: decoded.userId },
    });

    if (!foundUser) return res.status(404).json({ message: "User not found" });
    

    res.json(foundUser);
  } catch (error) {
    console.error("Error fetching authenticated user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// get all user 
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users" });
  }
}