// src/pages/api/inventory/[id].js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query; // This is the String ID (e.g., 'L001')

  switch (method) {
    case 'PUT':
      try {
        const item = await prisma.inventory_items.update({
          where: { id: id },
          data: {
            ...req.body,
            stock: req.body.stock ? parseInt(req.body.stock) : undefined,
            costPrice: req.body.costPrice ? parseFloat(req.body.costPrice) : undefined,
            salePrice: req.body.salePrice ? parseFloat(req.body.salePrice) : undefined,
          },
        });
        res.status(200).json({ success: true, data: item });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        await prisma.inventory_items.delete({ where: { id: id } });
        res.status(200).json({ success: true, message: 'Deleted' });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}