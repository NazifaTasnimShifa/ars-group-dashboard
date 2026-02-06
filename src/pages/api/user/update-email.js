// src/pages/api/user/update-email.js
// Update user email with password verification
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
    const { method } = req;
    const user = req.user;

    if (method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
    }

    try {
        const { currentPassword, newEmail } = req.body;

        if (!currentPassword || !newEmail) {
            return res.status(400).json({ success: false, message: 'Current password and new email are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        // Get current user with password
        const currentUser = await prisma.user.findUnique({
            where: { id: user.id }
        });

        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify current password
        const passwordValid = await bcrypt.compare(currentPassword, currentUser.password);
        if (!passwordValid) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        // Check if new email is already in use
        const existingUser = await prisma.user.findUnique({
            where: { email: newEmail }
        });

        if (existingUser && existingUser.id !== user.id) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }

        // Update email
        await prisma.user.update({
            where: { id: user.id },
            data: { email: newEmail }
        });

        res.status(200).json({ success: true, message: 'Email updated successfully' });
    } catch (error) {
        console.error('Update Email API Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export default withAuth(handler);
