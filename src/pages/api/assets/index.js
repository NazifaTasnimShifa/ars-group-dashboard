// src/pages/api/assets/index.js
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
  const { method } = req;
  const { company_id } = req.query;

  try {
    switch (method) {
      case 'GET':
        if (!company_id) return res.status(400).json({ success: false, message: 'Company ID required' });
        const assets = await prisma.fixedAsset.findMany({
          where: { assetCode: { startsWith: company_id } },
          orderBy: { acquisitionDate: 'desc' }
        });
        res.status(200).json({ success: true, data: assets });
        break;

      case 'POST':
        const asset = await prisma.fixedAsset.create({
          data: {
            assetCode: req.body.id || `FA-${Date.now()}`,
            name: req.body.name,
            category: req.body.assetType || 'OTHER',
            acquisitionDate: new Date(req.body.acquisitionDate),
            acquisitionCost: parseFloat(req.body.cost),
            usefulLifeYears: req.body.usefulLifeYears || 10,
            depreciationMethod: 'STRAIGHT_LINE',
            depreciationRate: req.body.depreciationRate || 10,
            accumulatedDepreciation: parseFloat(req.body.depreciation || 0),
            bookValue: parseFloat(req.body.bookValue || req.body.cost),
            status: 'ACTIVE',
            location: req.body.location,
            notes: req.body.notes
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

export default withAuth(handler, ['USER', 'MANAGER', 'ADMIN', 'CASHIER']);
