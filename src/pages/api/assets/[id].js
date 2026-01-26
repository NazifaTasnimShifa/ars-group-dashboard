// src/pages/api/assets/[id].js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query; 

  switch (method) {
    case 'PUT':
      try {
        const asset = await prisma.fixed_assets.update({
          where: { id: id },
          data: {
            ...req.body,
            acquisitionDate: req.body.acquisitionDate ? new Date(req.body.acquisitionDate) : undefined,
            cost: req.body.cost ? parseFloat(req.body.cost) : undefined,
            depreciation: req.body.depreciation ? parseFloat(req.body.depreciation) : undefined,
            bookValue: req.body.bookValue ? parseFloat(req.body.bookValue) : undefined,
          },
        });
        res.status(200).json({ success: true, data: asset });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        await prisma.fixed_assets.delete({ where: { id: id } });
        res.status(200).json({ success: true, message: 'Deleted' });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}