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

// export const localSignup = async (req: Request, res: Response) => {
//   try {
//     const { username, email, password } = req.body;

//     // Check if user already exists
//     const existingUser = await prisma.user.findUnique({ 
//       where: { 
//         email 
//       } 
//     });

//     if (existingUser) {
//       return res.status(400).json({ error: 'User already exists' });
//     }

//     // Hash password
//     const hashedPassword = await hashPassword(password);

//     // Create new user
//     const user = await prisma.user.create({
//       data: {
//         username,
//         email,
//         password: hashedPassword,
//       }
//     });

//     // Generate JWT
//     const token = generateAccessToken(user.userId.toString());

//     res.status(201).json({ 
//       user: { 
//         id: user.userId, 
//         username: user.username, 
//         email: user.email 
//       }, 
//       token 
//     });
//   } catch (error: any) {
//     res.status(500).json({ error: 'Signup failed' ,message: error.message});
//   }
// };

// export const localLogin = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     // Find user
//     const user = await prisma.user.findUnique({ 
//       where: { email } 
//     });

//     if (!user) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     // Check password
//     const isMatch = await comparePassword(password, user.password || '');

//     if (!isMatch) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     // Generate token
//     const token = generateAccessToken(user.userId.toString());

//     res.json({ 
//       user: { 
//         id: user.userId, 
//         username: user.username, 
//         email: user.email 
//       }, 
//       token 
//     });
//   } catch (error:any) {
//     res.status(500).json({ error: 'Login failed',message: error.message });
//   }
// };

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