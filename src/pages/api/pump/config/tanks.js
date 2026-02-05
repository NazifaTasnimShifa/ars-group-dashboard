// src/pages/api/pump/config/tanks.js
// API for managing storage tanks

import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
    const { company_id, branch_id } = req.query;

    if (!company_id) {
        return res.status(400).json({ success: false, message: 'company_id is required' });
    }

    try {
        // GET - List all tanks
        if (req.method === 'GET') {
            const whereClause = {
                branch: { businessId: company_id },
                isActive: true
            };
            
            if (branch_id) {
                whereClause.branchId = branch_id;
            }

            const tanks = await prisma.storageTank.findMany({
                where: whereClause,
                orderBy: { tankNumber: 'asc' },
                include: {
                    fuelType: true,
                    branch: true
                }
            });

            return res.status(200).json({
                success: true,
                data: tanks.map(t => ({
                    id: t.id,
                    tankNumber: t.tankNumber,
                    branchId: t.branchId,
                    branchName: t.branch.name,
                    fuelTypeId: t.fuelTypeId,
                    fuelTypeName: t.fuelType.name,
                    capacityLiters: Number(t.capacityLiters),
                    currentStock: Number(t.currentStock),
                    lastCalibrationDate: t.lastCalibrationDate,
                    isActive: t.isActive
                }))
            });
        }

        // POST - Create new tank
        if (req.method === 'POST') {
            const { branchId, fuelTypeId, tankNumber, capacityLiters, initialStock } = req.body;

            if (!branchId || !fuelTypeId || !tankNumber || !capacityLiters) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'branchId, fuelTypeId, tankNumber, and capacityLiters are required' 
                });
            }

            // Check for duplicate tank number in the branch
            const existing = await prisma.storageTank.findFirst({
                where: { branchId, tankNumber }
            });

            if (existing) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Tank "${tankNumber}" already exists in this branch` 
                });
            }

            const tank = await prisma.storageTank.create({
                data: {
                    branchId,
                    fuelTypeId,
                    tankNumber,
                    capacityLiters,
                    currentStock: initialStock || 0
                }
            });

            return res.status(201).json({
                success: true,
                message: 'Storage tank created successfully',
                data: { id: tank.id }
            });
        }

        // PUT - Update tank
        if (req.method === 'PUT') {
            const { id, tankNumber, capacityLiters, currentStock, fuelTypeId, isActive } = req.body;

            if (!id) {
                return res.status(400).json({ success: false, message: 'id is required' });
            }

            const updateData = {};
            if (tankNumber !== undefined) updateData.tankNumber = tankNumber;
            if (capacityLiters !== undefined) updateData.capacityLiters = capacityLiters;
            if (currentStock !== undefined) updateData.currentStock = currentStock;
            if (fuelTypeId !== undefined) updateData.fuelTypeId = fuelTypeId;
            if (isActive !== undefined) updateData.isActive = isActive;

            await prisma.storageTank.update({
                where: { id },
                data: updateData
            });

            return res.status(200).json({
                success: true,
                message: 'Storage tank updated successfully'
            });
        }

        // DELETE - Deactivate tank
        if (req.method === 'DELETE') {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ success: false, message: 'id is required' });
            }

            await prisma.storageTank.update({
                where: { id },
                data: { isActive: false }
            });

            return res.status(200).json({
                success: true,
                message: 'Storage tank deactivated successfully'
            });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });

    } catch (error) {
        console.error('Tanks API Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export default withAuth(handler, ['MANAGER', 'ADMIN']);
