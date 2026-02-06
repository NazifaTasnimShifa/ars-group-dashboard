// src/pages/api/user/profile.js
// Get current user profile data
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
    const { method } = req;
    const user = req.user;

    if (method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
    }

    try {
        const userData = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                role: true,
                business: true
            }
        });

        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Return user data without password
        const profile = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            phone: userData.phone,
            role: {
                id: userData.role.id,
                name: userData.role.name,
                displayName: userData.role.displayName
            },
            business: userData.business ? {
                id: userData.business.id,
                name: userData.business.name,
                code: userData.business.code
            } : null,
            lastLoginAt: userData.lastLoginAt
        };

        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        console.error('Profile API Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export default withAuth(handler);
