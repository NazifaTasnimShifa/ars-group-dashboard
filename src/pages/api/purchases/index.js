// src/pages/api/purchases/index.js
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
  const { method } = req;
  const { company_id } = req.query;

  try {
    switch (method) {
      case 'GET':
        if (!company_id) return res.status(400).json({ success: false, message: 'Company ID required' });
        const purchases = await prisma.purchases.findMany({
          where: { company_id: String(company_id) },
          orderBy: { date: 'desc' }
        });
        res.status(200).json({ success: true, data: purchases });
        break;

      case 'POST':
        const purchase = await prisma.purchases.create({
          data: {
            ...req.body,
            date: new Date(req.body.date),
            amount: parseFloat(req.body.amount),
          },
        });
        res.status(201).json({ success: true, data: purchase });
        break;

      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export default withAuth(handler, ['admin', 'manager', 'user']);