// src/pages/api/inventory/[id].js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try {
    switch (method) {
      case 'PUT':
        const item = await prisma.inventory_items.update({
          where: { id: id },
          data: {
            name: req.body.name,
            sku: req.body.sku,
            category: req.body.category,
            unit: req.body.unit,
            status: req.body.status,
            stock: req.body.stock !== undefined ? parseInt(req.body.stock) : undefined,
            costPrice: req.body.costPrice !== undefined ? parseFloat(req.body.costPrice) : undefined,
            salePrice: req.body.salePrice !== undefined ? parseFloat(req.body.salePrice) : undefined,
          },
        });
        res.status(200).json({ success: true, data: item });
        break;

      case 'DELETE':
        await prisma.inventory_items.delete({ where: { id: id } });
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