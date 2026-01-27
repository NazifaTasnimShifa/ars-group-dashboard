// src/pages/api/process-loss/[id].js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try {
    switch (method) {
      case 'PUT':
        const updatedLoss = await prisma.process_loss.update({
          where: { id: id },
          data: {
            product: req.body.product,
            type: req.body.type,
            notes: req.body.notes,
            quantity: req.body.quantity ? parseFloat(req.body.quantity) : undefined,
          },
        });
        res.status(200).json({ success: true, data: updatedLoss });
        break;

      case 'DELETE':
        await prisma.process_loss.delete({ where: { id: id } });
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