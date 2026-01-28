// src/pages/api/creditors/index.js
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
  const { method } = req;
  const { company_id } = req.query;

  try {
    switch (method) {
      case 'GET':
        if (!company_id) return res.status(400).json({ success: false, message: 'Company ID required' });
        const creditors = await prisma.creditors.findMany({
          where: { company_id: String(company_id) },
          orderBy: { name: 'asc' }
        });
        res.status(200).json({ success: true, data: creditors });
        break;

      case 'POST':
        const { id, ...dataToSave } = req.body;
        const creditor = await prisma.creditors.create({
          data: {
            ...dataToSave,
            due: new Date(req.body.due),
            amount: parseFloat(req.body.amount),
            aging: parseInt(req.body.aging) || 0
          },
        });
        res.status(201).json({ success: true, data: creditor });
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