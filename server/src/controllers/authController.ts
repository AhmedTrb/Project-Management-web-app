import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { User } from '@prisma/client';
import { 
    generateAccessToken,
  generateRefreshToken,
} from '../utils/jwt';
import { 
  hashPassword, 
  comparePassword 
} from '../utils/password';

const prisma = new PrismaClient();

export const localLogin = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
        if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      // Find user in database
      const user = await prisma.user.findUnique({ where: { email } });
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' }); // unauthorized
      }
  
      // evaluate password 
      const isMatch = await comparePassword(password, user.password || '');
  
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // Generate access & refresh tokens
      const accessToken = generateAccessToken(user.userId.toString());
      const refreshToken = generateRefreshToken(user.userId.toString());
      
      // Store the refresh token in an HTTP-only cookie
      res.cookie('jwt', refreshToken, {
        httpOnly: true,        // Prevents client-side access
        secure: true,          // Ensures cookie is only sent over HTTPS (required in production)
        sameSite: 'none',      // Required for cross-origin requests
        path: '/api/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
      });
  
      // Send the access token in response
      res.json({
        user: user,
        token:accessToken
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Login failed', message: error.message });
    }
  };


export const localSignup = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { 
        email 
      } 
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        profilePictureUrl:"https://avatar.iran.liara.run/public"
      }
    });

    // Generate JWT
    const token = generateAccessToken(user.userId.toString());

    res.status(201).json({ 
      user: { 
        id: user.userId, 
        username: user.username, 
        email: user.email 
      }, 
      token 
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Signup failed' ,message: error.message});
  }
};


export const logout = async (req: Request, res: Response) => {
  res.clearCookie('jwt');
  res.json({ message: 'Logged out' });
}