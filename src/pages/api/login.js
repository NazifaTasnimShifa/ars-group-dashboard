// src/pages/api/login.js
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    // Find user with role and business relations
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: {
        role: true,
        business: true
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is disabled. Contact admin.' });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Prepare user response (exclude password)
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: {
        id: user.role.id,
        name: user.role.name,
        displayName: user.role.displayName,
        permissions: user.role.permissions
      },
      business: user.business ? {
        id: user.business.id,
        code: user.business.code,
        name: user.business.name,
        shortName: user.business.shortName,
        type: user.business.type,
        settings: user.business.settings
      } : null,
      isSuperOwner: user.role.name === 'super_owner',
      businessId: user.businessId
    };

    // Generate JWT token for API authorization
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role.name.toUpperCase(), // USER, MANAGER, ADMIN format
      company_id: user.businessId
    });

    return res.status(200).json({
      success: true,
      token: token,
      user: userResponse
    });

  } catch (error) {
    console.error("Login API Error:", error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
}