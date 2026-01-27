// src/pages/api/sales/[id].js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try {
    switch (method) {
      case 'PUT':
        const sale = await prisma.sales.update({
          where: { id: id },
          data: {
            customer: req.body.customer,
            status: req.body.status,
            date: req.body.date ? new Date(req.body.date) : undefined,
            amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
          },
        });
        res.status(200).json({ success: true, data: sale });
        break;

      case 'DELETE':
        await prisma.sales.delete({ where: { id: id } });
        res.status(200).json({ success: true, message: 'Deleted' });
        break;

      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}