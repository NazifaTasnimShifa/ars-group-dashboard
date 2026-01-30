// src/pages/api/inventory/index.js
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
  const { method } = req;
  const { company_id } = req.query;

  try {
    switch (method) {
      case 'GET':
        if (!company_id) return res.status(400).json({ success: false, message: 'Company ID required' });
        const items = await prisma.inventory_items.findMany({
          where: { company_id: String(company_id) },
          orderBy: { name: 'asc' }
        });
        res.status(200).json({ success: true, data: items });
        break;

      case 'POST':
        const newItem = await prisma.inventory_items.create({
          data: {
            ...req.body,
            stock: parseInt(req.body.stock),
            costPrice: parseFloat(req.body.costPrice),
            salePrice: parseFloat(req.body.salePrice),
          },
        });
        res.status(201).json({ success: true, data: newItem });
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