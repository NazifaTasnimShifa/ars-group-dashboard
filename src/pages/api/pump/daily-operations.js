// src/pages/api/pump/daily-operations.js
// API for daily pump operations - shift and meter readings

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
        // GET - Fetch shift and readings for the date
        if (req.method === 'GET') {
            // Find or create today's shift
            let shift = await prisma.shiftInstance.findFirst({
                where: {
                    date: targetDate,
                    shift: {
                        branch: {
                            businessId: company_id
                        }
                    }
                },
                include: {
                    meterReadings: {
                        include: {
                            nozzle: {
                                include: {
                                    pump: true,
                                    fuelType: true
                                }
                            }
                        }
                    }
                }
            });

            // If no shift exists, fetch nozzles/pumps to show empty form
            const nozzles = await prisma.nozzle.findMany({
                where: {
                    pump: {
                        branch: {
                            businessId: company_id
                        }
                    },
                    isActive: true
                },
                include: {
                    pump: true,
                    fuelType: true
                }
            });

            // Build pump data with readings if available
            const pumpsData = nozzles.map(nozzle => {
                const reading = shift?.meterReadings?.find(r => r.nozzleId === nozzle.id);
                const openingReading = reading?.readingType === 'OPENING'
                    ? Number(reading.readingValue)
                    : Number(nozzle.currentMeterReading);
                const closingReading = shift?.meterReadings?.find(
                    r => r.nozzleId === nozzle.id && r.readingType === 'CLOSING'
                );

                return {
                    id: nozzle.id,
                    nozzleNumber: nozzle.nozzleNumber,
                    pumpId: nozzle.pumpId,
                    pumpName: `${nozzle.pump.pumpNumber} - Nozzle ${nozzle.nozzleNumber}`,
                    fuelType: nozzle.fuelType.name,
                    fuelTypeId: nozzle.fuelTypeId,
                    pricePerLiter: Number(nozzle.fuelType.currentPrice),
                    openingReading: openingReading,
                    closingReading: closingReading ? Number(closingReading.readingValue) : null
                };
            });

            return res.status(200).json({
                success: true,
                data: {
                    shiftId: shift?.id || null,
                    date: targetDate.toISOString().split('T')[0],
                    status: shift?.status || 'OPEN',
                    pumps: pumpsData
                }
            });
        }

        // POST - Save meter readings
        if (req.method === 'POST') {
            const { readings, shiftId } = req.body;

            if (!readings || !Array.isArray(readings)) {
                return res.status(400).json({ success: false, message: 'readings array is required' });
            }

            // Find or create shift for today
            let shift;
            if (shiftId) {
                shift = await prisma.shiftInstance.findUnique({ where: { id: shiftId } });
            }

            if (!shift) {
                // Find the default shift for this business
                const defaultShift = await prisma.shift.findFirst({
                    where: {
                        branch: { businessId: company_id },
                        isActive: true
                    }
                });

                if (!defaultShift) {
                    return res.status(400).json({ success: false, message: 'No shift configuration found. Please set up shifts first.' });
                }

                // Create shift instance for today
                shift = await prisma.shiftInstance.create({
                    data: {
                        shiftId: defaultShift.id,
                        date: targetDate,
                        operatorId: req.user.id,
                        status: 'OPEN',
                        openingCash: 0
                    }
                });
            }

            // Upsert meter readings
            for (const reading of readings) {
                if (reading.closingReading !== null && reading.closingReading !== undefined) {
                    // Check if closing reading already exists
                    const existing = await prisma.meterReading.findFirst({
                        where: {
                            nozzleId: reading.nozzleId,
                            shiftInstanceId: shift.id,
                            readingType: 'CLOSING'
                        }
                    });

                    if (existing) {
                        await prisma.meterReading.update({
                            where: { id: existing.id },
                            data: {
                                readingValue: reading.closingReading,
                                readingTime: new Date()
                            }
                        });
                    } else {
                        await prisma.meterReading.create({
                            data: {
                                nozzleId: reading.nozzleId,
                                shiftInstanceId: shift.id,
                                readingType: 'CLOSING',
                                readingValue: reading.closingReading,
                                readingTime: new Date()
                            }
                        });
                    }

                    // Update nozzle's current meter reading
                    await prisma.nozzle.update({
                        where: { id: reading.nozzleId },
                        data: { currentMeterReading: reading.closingReading }
                    });
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Readings saved successfully',
                shiftId: shift.id
            });
        }

        // PUT - Close the day
        if (req.method === 'PUT') {
            const { shiftId } = req.body;

            if (!shiftId) {
                return res.status(400).json({ success: false, message: 'shiftId is required' });
            }

            await prisma.shiftInstance.update({
                where: { id: shiftId },
                data: {
                    status: 'CLOSED',
                    closedAt: new Date()
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Day closed successfully'
            });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });

    } catch (error) {
        console.error('Daily Operations API Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export default withAuth(handler, ['USER', 'MANAGER', 'ADMIN', 'CASHIER']);
