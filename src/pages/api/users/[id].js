// src/pages/api/users/[id].js
// API endpoint for individual user operations - Update and Delete
// Only accessible by SUPER_OWNER role

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
    const { method } = req;
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    switch (method) {
        case 'GET':
            return handleGet(req, res, id);
        case 'PUT':
            return handlePut(req, res, id);
        case 'DELETE':
            return handleDelete(req, res, id);
        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
    }
}

// GET /api/users/[id] - Get a single user
async function handleGet(req, res, id) {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        permissions: true
                    }
                },
                business: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        shortName: true,
                        type: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
}

// PUT /api/users/[id] - Update a user
async function handlePut(req, res, id) {
    try {
        const { name, email, password, phone, roleId, businessId, isActive } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id }
        });

        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // If email is being changed, check it's not already taken
        if (email && email !== existingUser.email) {
            const emailTaken = await prisma.user.findUnique({
                where: { email }
            });
            if (emailTaken) {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already in use by another user'
                });
            }
        }

        // Build update data
        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (roleId !== undefined) updateData.roleId = roleId;
        if (businessId !== undefined) updateData.businessId = businessId || null;
        if (isActive !== undefined) updateData.isActive = isActive;

        // If password is provided, hash it
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true
                    }
                },
                business: {
                    select: {
                        id: true,
                        name: true,
                        shortName: true
                    }
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ success: false, message: 'Failed to update user' });
    }
}

// DELETE /api/users/[id] - Soft delete a user (deactivate)
async function handleDelete(req, res, id) {
    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id },
            include: { role: true }
        });

        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent deleting super_owner users
        if (existingUser.role.name === 'super_owner') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete a Super Owner account'
            });
        }

        // Soft delete - just deactivate
        await prisma.user.update({
            where: { id },
            data: { isActive: false }
        });

        return res.status(200).json({
            success: true,
            message: 'User deactivated successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
}

// Only SUPER_OWNER can access this endpoint
export default withAuth(handler, ['SUPER_OWNER']);
