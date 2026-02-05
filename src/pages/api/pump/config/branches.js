// src/pages/api/pump/config/branches.js
// API for managing branches

import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
    const { company_id } = req.query;

    if (!company_id) {
        return res.status(400).json({ success: false, message: 'company_id is required' });
    }

    try {
        // GET - List all branches
        if (req.method === 'GET') {
            const branches = await prisma.branch.findMany({
                where: { businessId: company_id },
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: {
                            pumps: true,
                            storageTanks: true
                        }
                    }
                }
            });

            return res.status(200).json({
                success: true,
                data: branches.map(b => ({
                    id: b.id,
                    code: b.code,
                    name: b.name,
                    address: b.address,
                    phone: b.phone,
                    isActive: b.isActive,
                    pumpCount: b._count.pumps,
                    tankCount: b._count.storageTanks
                }))
            });
        }

        // POST - Create new branch
        if (req.method === 'POST') {
            const { code, name, address, phone } = req.body;

            if (!code || !name) {
                return res.status(400).json({ success: false, message: 'code and name are required' });
            }

            // Check for duplicate code
            const existing = await prisma.branch.findFirst({
                where: { businessId: company_id, code }
            });

            if (existing) {
                return res.status(400).json({ success: false, message: `Branch with code "${code}" already exists` });
            }

            const branch = await prisma.branch.create({
                data: {
                    businessId: company_id,
                    code,
                    name,
                    address: address || null,
                    phone: phone || null
                }
            });

            // Create default shift for the branch
            await prisma.shift.create({
                data: {
                    branchId: branch.id,
                    name: 'Day Shift',
                    startTime: '06:00',
                    endTime: '22:00'
                }
            });

            return res.status(201).json({
                success: true,
                message: 'Branch created successfully',
                data: { id: branch.id }
            });
        }

        // PUT - Update branch
        if (req.method === 'PUT') {
            const { id, code, name, address, phone, isActive } = req.body;

            if (!id) {
                return res.status(400).json({ success: false, message: 'id is required' });
            }

            const updateData = {};
            if (code !== undefined) updateData.code = code;
            if (name !== undefined) updateData.name = name;
            if (address !== undefined) updateData.address = address;
            if (phone !== undefined) updateData.phone = phone;
            if (isActive !== undefined) updateData.isActive = isActive;

            await prisma.branch.update({
                where: { id },
                data: updateData
            });

            return res.status(200).json({
                success: true,
                message: 'Branch updated successfully'
            });
        }

        // DELETE - Deactivate branch
        if (req.method === 'DELETE') {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ success: false, message: 'id is required' });
            }

            await prisma.branch.update({
                where: { id },
                data: { isActive: false }
            });

            return res.status(200).json({
                success: true,
                message: 'Branch deactivated successfully'
            });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });

    } catch (error) {
        console.error('Branches API Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export default withAuth(handler, ['MANAGER', 'ADMIN']);
