// src/pages/api/debtors/[id].js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try {
    const numericId = parseInt(id);
    if (isNaN(numericId)) return res.status(400).json({ error: 'Invalid ID format' });

    switch (method) {
      case 'PUT':
        const debtor = await prisma.debtors.update({
          where: { id: numericId },
          data: {
            name: req.body.name,
            contactPerson: req.body.contactPerson,
            email: req.body.email,
            phone: req.body.phone,
            due: req.body.due ? new Date(req.body.due) : undefined,
            amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
            aging: req.body.aging ? parseInt(req.body.aging) : undefined,
          },
        });
        res.status(200).json({ success: true, data: debtor });
        break;

      case 'DELETE':
        await prisma.debtors.delete({ where: { id: numericId } });
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