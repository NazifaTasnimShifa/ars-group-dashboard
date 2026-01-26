// src/pages/api/debtors/index.js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { company_id } = req.query;

  switch (method) {
    case 'GET':
      if (!company_id) return res.status(400).json({ success: false, message: 'Company ID required' });
      try {
        const debtors = await prisma.debtors.findMany({
          where: { company_id: String(company_id) },
          orderBy: { name: 'asc' }
        });
        res.status(200).json({ success: true, data: debtors });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const debtor = await prisma.debtors.create({
          data: {
            ...req.body,
            due: new Date(req.body.due), // Ensure date format
            amount: parseFloat(req.body.amount),
            aging: parseInt(req.body.aging) || 0
          },
        });
        res.status(201).json({ success: true, data: debtor });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
      break;
  }
}