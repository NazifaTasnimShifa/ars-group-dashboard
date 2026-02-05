// src/pages/api/pump/config/pumps.js
// API for managing pumps and nozzles

import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
    const { company_id, branch_id } = req.query;

    if (!company_id) {
        return res.status(400).json({ success: false, message: 'company_id is required' });
    }

    try {
        // GET - List all pumps with nozzles
        if (req.method === 'GET') {
            const whereClause = {
                branch: { businessId: company_id },
                isActive: true
            };
            
            if (branch_id) {
                whereClause.branchId = branch_id;
            }

            const pumps = await prisma.pump.findMany({
                where: whereClause,
                orderBy: { pumpNumber: 'asc' },
                include: {
                    branch: true,
                    nozzles: {
                        where: { isActive: true },
                        include: {
                            fuelType: true,
                            tank: true
                        },
                        orderBy: { nozzleNumber: 'asc' }
                    }
                }
            });

            return res.status(200).json({
                success: true,
                data: pumps.map(p => ({
                    id: p.id,
                    pumpNumber: p.pumpNumber,
                    branchId: p.branchId,
                    branchName: p.branch.name,
                    make: p.make,
                    model: p.model,
                    isMpu: p.isMpu,
                    isActive: p.isActive,
                    nozzles: p.nozzles.map(n => ({
                        id: n.id,
                        nozzleNumber: n.nozzleNumber,
                        fuelTypeId: n.fuelTypeId,
                        fuelTypeName: n.fuelType.name,
                        tankId: n.tankId,
                        tankNumber: n.tank.tankNumber,
                        currentMeterReading: Number(n.currentMeterReading),
                        isActive: n.isActive
                    }))
                }))
            });
        }

        // POST - Create new pump with nozzles
        if (req.method === 'POST') {
            const { branchId, pumpNumber, make, model, isMpu, nozzles } = req.body;

            if (!branchId || !pumpNumber) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'branchId and pumpNumber are required' 
                });
            }

            // Check for duplicate pump number
            const existing = await prisma.pump.findFirst({
                where: { branchId, pumpNumber }
            });

            if (existing) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Pump "${pumpNumber}" already exists in this branch` 
                });
            }

            // Create pump with nozzles in a transaction
            const pump = await prisma.$transaction(async (tx) => {
                const newPump = await tx.pump.create({
                    data: {
                        branchId,
                        pumpNumber,
                        make: make || null,
                        model: model || null,
                        isMpu: isMpu || false
                    }
                });

                // Create nozzles if provided
                if (nozzles && Array.isArray(nozzles) && nozzles.length > 0) {
                    for (const nozzle of nozzles) {
                        await tx.nozzle.create({
                            data: {
                                pumpId: newPump.id,
                                nozzleNumber: nozzle.nozzleNumber,
                                fuelTypeId: nozzle.fuelTypeId,
                                tankId: nozzle.tankId,
                                currentMeterReading: nozzle.openingReading || 0
                            }
                        });
                    }
                }

                return newPump;
            });

            return res.status(201).json({
                success: true,
                message: 'Pump created successfully',
                data: { id: pump.id }
            });
        }

        // PUT - Update pump or add/update nozzle
        if (req.method === 'PUT') {
            const { id, pumpNumber, make, model, isMpu, isActive, nozzle } = req.body;

            if (!id) {
                return res.status(400).json({ success: false, message: 'id is required' });
            }

            // Update pump details
            const pumpUpdateData = {};
            if (pumpNumber !== undefined) pumpUpdateData.pumpNumber = pumpNumber;
            if (make !== undefined) pumpUpdateData.make = make;
            if (model !== undefined) pumpUpdateData.model = model;
            if (isMpu !== undefined) pumpUpdateData.isMpu = isMpu;
            if (isActive !== undefined) pumpUpdateData.isActive = isActive;

            if (Object.keys(pumpUpdateData).length > 0) {
                await prisma.pump.update({
                    where: { id },
                    data: pumpUpdateData
                });
            }

            // Handle nozzle update (add or update)
            if (nozzle) {
                if (nozzle.id) {
                    // Update existing nozzle
                    const nozzleUpdateData = {};
                    if (nozzle.nozzleNumber !== undefined) nozzleUpdateData.nozzleNumber = nozzle.nozzleNumber;
                    if (nozzle.fuelTypeId !== undefined) nozzleUpdateData.fuelTypeId = nozzle.fuelTypeId;
                    if (nozzle.tankId !== undefined) nozzleUpdateData.tankId = nozzle.tankId;
                    if (nozzle.currentMeterReading !== undefined) nozzleUpdateData.currentMeterReading = nozzle.currentMeterReading;
                    if (nozzle.isActive !== undefined) nozzleUpdateData.isActive = nozzle.isActive;

                    await prisma.nozzle.update({
                        where: { id: nozzle.id },
                        data: nozzleUpdateData
                    });
                } else {
                    // Add new nozzle
                    await prisma.nozzle.create({
                        data: {
                            pumpId: id,
                            nozzleNumber: nozzle.nozzleNumber,
                            fuelTypeId: nozzle.fuelTypeId,
                            tankId: nozzle.tankId,
                            currentMeterReading: nozzle.openingReading || 0
                        }
                    });
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Pump updated successfully'
            });
        }

        // DELETE - Deactivate pump
        if (req.method === 'DELETE') {
            const { id, nozzleId } = req.query;

            if (nozzleId) {
                // Deactivate specific nozzle
                await prisma.nozzle.update({
                    where: { id: nozzleId },
                    data: { isActive: false }
                });

                return res.status(200).json({
                    success: true,
                    message: 'Nozzle deactivated successfully'
                });
            }

            if (!id) {
                return res.status(400).json({ success: false, message: 'id is required' });
            }

            // Deactivate pump and all its nozzles
            await prisma.$transaction([
                prisma.nozzle.updateMany({
                    where: { pumpId: id },
                    data: { isActive: false }
                }),
                prisma.pump.update({
                    where: { id },
                    data: { isActive: false }
                })
            ]);

            return res.status(200).json({
                success: true,
                message: 'Pump deactivated successfully'
            });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });

    } catch (error) {
        console.error('Pumps API Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export default withAuth(handler, ['MANAGER', 'ADMIN']);
