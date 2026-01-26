// src/pages/api/debtors/[id].js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  switch (method) {
    case 'PUT':
      try {
        const debtor = await prisma.debtors.update({
          where: { id: parseInt(id) },
          data: {
            ...req.body,
            due: req.body.due ? new Date(req.body.due) : undefined,
            amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
          },
        });
        res.status(200).json({ success: true, data: debtor });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        await prisma.debtors.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ success: true, message: 'Deleted successfully' });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
      break;
  }
}