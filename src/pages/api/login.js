// src/pages/api/login.js

import prisma from '@/lib/prisma'; // Use the shared helper!
import bcrypt from 'bcryptjs';

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

    // Check if user exists AND password matches
    // user.password is the hash from the DB, 'password' is the plaintext input
    if (user && bcrypt.compareSync(password, user.password)) {
      
      // Remove sensitive data before sending to frontend
      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).json({
        success: true,
        user: userWithoutPassword
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error("Login API Error:", error);
    return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}