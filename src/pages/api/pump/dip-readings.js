// src/pages/api/pump/dip-readings.js
// API for tank dip stock readings

import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
    const { company_id, date } = req.query;

    if (!company_id) {
        return res.status(400).json({ success: false, message: 'company_id is required' });
    }

    // Default to today if no date provided
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    try {
        // GET - Fetch dip readings and tanks for the date
        if (req.method === 'GET') {
            // Fetch all tanks for this business
            const tanks = await prisma.storageTank.findMany({
                where: {
                    branch: {
                        businessId: company_id
                    },
                    isActive: true
                },
                include: {
                    fuelType: true,
                    branch: true
                },
                orderBy: {
                    tankNumber: 'asc'
                }
            });

            // Fetch dip readings for today
            const dipReadings = await prisma.dipReading.findMany({
                where: {
                    readingDate: targetDate,
                    tank: {
                        branch: {
                            businessId: company_id
                        }
                    }
                },
                include: {
                    tank: true
                }
            });

            // Fetch shift and meter readings for sales calculation
            const shift = await prisma.shiftInstance.findFirst({
                where: {
                    date: targetDate,
                    shift: { branch: { businessId: company_id } }
                },
                include: {
                    meterReadings: {
                        include: { nozzle: true }
                    }
                }
            });

            const salesPerTank = {};
            if (shift?.meterReadings) {
                const nozzleMap = {};
                shift.meterReadings.forEach(r => {
                    if (!nozzleMap[r.nozzleId]) nozzleMap[r.nozzleId] = {};
                    nozzleMap[r.nozzleId][r.readingType] = Number(r.readingValue);
                    nozzleMap[r.nozzleId].tankId = r.nozzle.tankId;
                });

                Object.values(nozzleMap).forEach(n => {
                    if (n.CLOSING !== undefined && n.OPENING !== undefined) {
                         const qty = n.CLOSING - n.OPENING;
                         if (qty > 0) salesPerTank[n.tankId] = (salesPerTank[n.tankId] || 0) + qty;
                    }
                });
            }

            // Build response with tanks and their readings
            const tanksData = tanks.map(tank => {
                const openingReading = dipReadings.find(
                    r => r.tankId === tank.id && r.readingType === 'OPENING'
                );
                const closingReading = dipReadings.find(
                    r => r.tankId === tank.id && r.readingType === 'CLOSING'
                );
                const receiptReading = dipReadings.find(
                    r => r.tankId === tank.id && r.readingType === 'RECEIPT'
                );

                return {
                    id: tank.id,
                    tankNumber: tank.tankNumber,
                    fuelType: tank.fuelType.name,
                    fuelTypeCode: tank.fuelType.code,
                    capacity: Number(tank.capacityLiters),
                    currentStock: Number(tank.currentStock),
                    openingDip: openingReading ? Number(openingReading.calculatedStock) : Number(tank.currentStock),
                    closingDip: closingReading ? Number(closingReading.calculatedStock) : null,
                    liftingToday: receiptReading ? Number(receiptReading.calculatedStock) : 0,
                    salesToday: salesPerTank[tank.id] || 0,
                    openingReadingId: openingReading?.id,
                    closingReadingId: closingReading?.id,
                    receiptReadingId: receiptReading?.id
                };
            });

            return res.status(200).json({
                success: true,
                data: {
                    date: targetDate.toISOString().split('T')[0],
                    tanks: tanksData
                }
            });
        }

        // POST - Save dip readings
        if (req.method === 'POST') {
            const { readings } = req.body;

            if (!readings || !Array.isArray(readings)) {
                return res.status(400).json({ success: false, message: 'readings array is required' });
            }

            // Save each reading
            for (const reading of readings) {
                const { tankId, readingType, dipMm, calculatedStock, temperature, notes } = reading;

                if (!tankId || !readingType || calculatedStock === null || calculatedStock === undefined) {
                    continue; // Skip invalid readings
                }

                // Check if reading already exists
                const existing = await prisma.dipReading.findFirst({
                    where: {
                        tankId,
                        readingDate: targetDate,
                        readingType
                    }
                });

                const readingData = {
                    tankId,
                    readingDate: targetDate,
                    readingTime: new Date(),
                    readingType,
                    dipMm: dipMm || 0,
                    calculatedStock,
                    temperature: temperature || null,
                    notes: notes || null
                };

                if (existing) {
                    // Update existing reading
                    await prisma.dipReading.update({
                        where: { id: existing.id },
                        data: readingData
                    });
                } else {
                    // Create new reading
                    await prisma.dipReading.create({
                        data: readingData
                    });
                }

                // Update tank's current stock if this is a closing reading
                if (readingType === 'CLOSING') {
                    await prisma.storageTank.update({
                        where: { id: tankId },
                        data: { currentStock: calculatedStock }
                    });
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Dip readings saved successfully'
            });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });

    } catch (error) {
        console.error('Dip Readings API Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export default withAuth(handler, ['USER', 'MANAGER', 'ADMIN', 'CASHIER']);
