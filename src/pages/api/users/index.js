// src/pages/api/users/index.js
// API endpoint for user management - List and Create users
// Only accessible by SUPER_OWNER role

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
    const { method } = req;

    switch (method) {
        case 'GET':
            return handleGet(req, res);
        case 'POST':
            return handlePost(req, res);
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
    }
}

// GET /api/users - List all users with their roles and businesses
async function handleGet(req, res) {
    try {
        const { businessId, roleId, search, includeInactive } = req.query;

        const where = {};

        // Filter by business if specified
        if (businessId && businessId !== 'all') {
            where.businessId = businessId;
        }

        // Filter by role if specified
        if (roleId) {
            where.roleId = roleId;
        }

        // Search by name or email
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } }
            ];
        }

        // By default, only show active users
        if (includeInactive !== 'true') {
            where.isActive = true;
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
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
                        code: true,
                        name: true,
                        shortName: true,
                        type: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json({
            success: true,
            data: users,
            count: users.length
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
}

// POST /api/users - Create a new user
async function handlePost(req, res) {
    try {
        const { name, email, password, phone, roleId, businessId } = req.body;

        // Validation
        if (!name || !email || !password || !roleId) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, password, and role are required'
            });
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'A user with this email already exists'
            });
        }

        // Verify role exists
        const role = await prisma.role.findUnique({
            where: { id: roleId }
        });

        if (!role) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        // If not super_owner role, business is required
        if (role.name !== 'super_owner' && !businessId) {
            return res.status(400).json({
                success: false,
                message: 'Business assignment is required for this role'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone: phone || null,
                roleId,
                businessId: businessId || null,
                isActive: true
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                isActive: true,
                createdAt: true,
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

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: newUser
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ success: false, message: 'Failed to create user' });
    }
}

// Only SUPER_OWNER can access this endpoint
export default withAuth(handler, ['SUPER_OWNER']);
