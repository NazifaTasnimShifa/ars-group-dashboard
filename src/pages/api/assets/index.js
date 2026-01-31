// src/pages/api/assets/index.js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { company_id } = req.query;

  try {
    switch (method) {
      case 'GET':
        if (!company_id) return res.status(400).json({ success: false, message: 'Company ID required' });
        const assets = await prisma.fixed_assets.findMany({
          where: { company_id: String(company_id) },
          orderBy: { acquisitionDate: 'desc' }
        });
        res.status(200).json({ success: true, data: assets });
        break;

      case 'POST':
        const asset = await prisma.fixed_assets.create({
          data: {
            ...req.body,
            acquisitionDate: new Date(req.body.acquisitionDate),
            cost: parseFloat(req.body.cost),
            depreciation: parseFloat(req.body.depreciation || 0),
            bookValue: parseFloat(req.body.bookValue || req.body.cost),
          },
        });
        res.status(201).json({ success: true, data: asset });
        break;

      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}
