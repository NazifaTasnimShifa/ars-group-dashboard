// src/pages/api/purchases/[id].js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query; // String ID

  switch (method) {
    case 'PUT':
      try {
        const purchase = await prisma.purchases.update({
          where: { id: id },
          data: {
            ...req.body,
            date: req.body.date ? new Date(req.body.date) : undefined,
            amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
          },
        });
        res.status(200).json({ success: true, data: purchase });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        await prisma.purchases.delete({ where: { id: id } });
        res.status(200).json({ success: true, message: 'Deleted' });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}