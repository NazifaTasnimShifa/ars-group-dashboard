// src/pages/api/process-loss/index.js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { company_id } = req.query;

  try {
    switch (method) {
      case 'GET':
        if (!company_id) return res.status(400).json({ success: false, message: 'Company ID required' });

        const { startDate, endDate } = req.query;
        let whereClause = { company_id: String(company_id) };

        if (startDate && endDate) {
          whereClause.date = {
            gte: new Date(startDate),
            lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
          };
        }

        const losses = await prisma.process_loss.findMany({
          where: whereClause,
          orderBy: { date: 'desc' }
        });
        res.status(200).json({ success: true, data: losses });
        break;

      case 'POST':
        const { company_id: bodyCompanyId, productId, quantity, date, reason } = req.body;
        const targetCompanyId = bodyCompanyId || company_id;

        try {
            const result = await prisma.$transaction(async (tx) => {
                // 1. Create Process Loss Record
                const newLoss = await tx.process_loss.create({
                    data: {
                        company_id: String(targetCompanyId),
                        productId: String(productId),
                        quantity: parseFloat(quantity),
                        date: new Date(date),
                        reason: reason
                    },
                });

                // 2. Deduct from Inventory
                await tx.inventory_items.update({
                    where: { id: String(productId) },
                    data: { stock: { decrement: parseFloat(quantity) } }
                });

                return newLoss;
            });
            
            res.status(201).json({ success: true, data: result });
        } catch (txError) {
             console.error("Transaction failed:", txError);
             res.status(400).json({ success: false, message: txError.message });
        }
        break;

      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}
