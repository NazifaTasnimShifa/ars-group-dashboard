// src/pages/api/creditors/[id].js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  const numericId = parseInt(id);

  if (isNaN(numericId)) return res.status(400).json({ error: 'Invalid ID' });

  try {
    switch (method) {
      case 'PUT':
        const creditor = await prisma.creditors.update({
          where: { id: numericId },
          data: {
            name: req.body.name,
            contactPerson: req.body.contactPerson,
            due: req.body.due ? new Date(req.body.due) : undefined,
            amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
            aging: req.body.aging ? parseInt(req.body.aging) : undefined,
          },
        });
        res.status(200).json({ success: true, data: creditor });
        break;

      case 'DELETE':
        await prisma.creditors.delete({ where: { id: numericId } });
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