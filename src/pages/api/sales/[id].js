// src/pages/api/sales/[id].js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query; // String ID like 'INV-001'

  switch (method) {
    case 'PUT':
      try {
        const sale = await prisma.sales.update({
          where: { id: id },
          data: {
            ...req.body,
            date: req.body.date ? new Date(req.body.date) : undefined,
            amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
          },
        });
        res.status(200).json({ success: true, data: sale });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        await prisma.sales.delete({ where: { id: id } });
        res.status(200).json({ success: true, message: 'Deleted' });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}