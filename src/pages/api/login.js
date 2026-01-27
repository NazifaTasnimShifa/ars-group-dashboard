// src/pages/api/login.js
import prisma from '@/lib/prisma';
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
    const user = await prisma.users.findUnique({
      where: { email: email },
    });

    if (user && bcrypt.compareSync(password, user.password)) {
      // Exclude password from response
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json({
        success: true,
        user: userWithoutPassword
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
  } catch (error) {
    console.error("Login API Error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}