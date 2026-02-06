// src/pages/api/user/update-name.js
// Update user name
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
    const { method } = req;
    const user = req.user;

    if (method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
    }

    try {
        const { name } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        // Update name
        await prisma.user.update({
            where: { id: user.id },
            data: { name: name.trim() }
        });

        res.status(200).json({ success: true, message: 'Name updated successfully' });
    } catch (error) {
        console.error('Update Name API Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export default withAuth(handler);
