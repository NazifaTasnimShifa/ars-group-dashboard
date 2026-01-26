// src/pages/api/creditors/index.js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { company_id } = req.query;

  switch (method) {
    case 'GET':
      if (!company_id) return res.status(400).json({ success: false, message: 'Company ID required' });
      try {
        const creditors = await prisma.creditors.findMany({
          where: { company_id: String(company_id) },
          orderBy: { name: 'asc' }
        });
        res.status(200).json({ success: true, data: creditors });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const creditor = await prisma.creditors.create({
          data: {
            ...req.body,
            due: new Date(req.body.due),
            amount: parseFloat(req.body.amount),
            aging: parseInt(req.body.aging) || 0
          },
        });
        res.status(201).json({ success: true, data: creditor });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}