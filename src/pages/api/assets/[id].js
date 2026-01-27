// src/pages/api/assets/[id].js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try {
    switch (method) {
      case 'PUT':
        const asset = await prisma.fixed_assets.update({
          where: { id: id },
          data: {
            name: req.body.name,
            acquisitionDate: req.body.acquisitionDate ? new Date(req.body.acquisitionDate) : undefined,
            cost: req.body.cost ? parseFloat(req.body.cost) : undefined,
            depreciation: req.body.depreciation ? parseFloat(req.body.depreciation) : undefined,
            bookValue: req.body.bookValue ? parseFloat(req.body.bookValue) : undefined,
          },
        });
        res.status(200).json({ success: true, data: asset });
        break;

      case 'DELETE':
        await prisma.fixed_assets.delete({ where: { id: id } });
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