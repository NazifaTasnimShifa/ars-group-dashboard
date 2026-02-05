// src/pages/api/process-loss/index.js
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
  const { method } = req;
  const { company_id, startDate, endDate } = req.query;

  try {
    switch (method) {
      case 'GET':
        if (!company_id) {
          return res.status(400).json({ success: false, message: 'Company ID required' });
        }

        // Try to fetch from ProcessLoss model (fuel-based)
        // If the model doesn't exist or fails, return empty array
        try {
          let whereClause = {};

          if (startDate && endDate) {
            whereClause.date = {
              gte: new Date(startDate),
              lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
          }

          const losses = await prisma.processLoss.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
            include: { fuelType: true }
          });

          // Transform to match frontend expectations
          const transformedLosses = losses.map(loss => ({
            id: loss.id,
            product: loss.fuelType?.name || 'Unknown',
            type: loss.lossType,
            quantity: Number(loss.lossQuantity),
            notes: loss.notes,
            date: loss.date
          }));

          return res.status(200).json({ success: true, data: transformedLosses });
        } catch (dbError) {
          console.log('ProcessLoss query error (returning empty):', dbError.message);
          // Return empty array if model doesn't exist or query fails
          return res.status(200).json({ success: true, data: [] });
        }

      case 'POST':
        // For now, return error as creating requires proper schema match
        return res.status(501).json({
          success: false,
          message: 'Process loss creation not yet implemented for this inventory type'
        });

      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Process loss API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export default withAuth(handler, ['ADMIN', 'MANAGER', 'SUPER_OWNER']);
