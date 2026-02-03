// src/pages/api/roles/index.js
// API endpoint for fetching available roles

import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }

    try {
        const roles = await prisma.role.findMany({
            select: {
                id: true,
                name: true,
                displayName: true,
                description: true,
                isSystem: true
            },
            orderBy: { name: 'asc' }
        });

        return res.status(200).json({
            success: true,
            data: roles
        });
    } catch (error) {
        console.error('Error fetching roles:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch roles' });
    }
}

// Only SUPER_OWNER can access this endpoint
export default withAuth(handler, ['SUPER_OWNER']);
