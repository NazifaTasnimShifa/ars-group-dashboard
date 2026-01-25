// src/pages/api/login.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email: email },
    });

    // Validate password
    // Note: In a real production app with new users, use bcrypt.hashSync to create passwords first.
    if (user && bcrypt.compareSync(password, user.password)) {
      
      // Remove sensitive data before sending to frontend
      const { password, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        user: userWithoutPassword
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error("Login API Error:", error);
    res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  } finally {
    await prisma.$disconnect();
  }
}