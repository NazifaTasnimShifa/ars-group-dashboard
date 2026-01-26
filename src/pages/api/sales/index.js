// src/pages/api/sales/index.js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { company_id } = req.query;

  switch (method) {
    case 'GET':
      if (!company_id) return res.status(400).json({ success: false, message: 'Company ID required' });
      try {
        const sales = await prisma.sales.findMany({
          where: { company_id: String(company_id) },
          orderBy: { date: 'desc' }
        });
        res.status(200).json({ success: true, data: sales });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const sale = await prisma.sales.create({
          data: {
            ...req.body,
            date: new Date(req.body.date),
            amount: parseFloat(req.body.amount),
          },
        });
        res.status(201).json({ success: true, data: sale });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}