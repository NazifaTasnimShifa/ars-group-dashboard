// src/pages/api/inventory/index.js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { company_id } = req.query;

  switch (method) {
    case 'GET':
      if (!company_id) return res.status(400).json({ success: false, message: 'Company ID required' });
      try {
        const items = await prisma.inventory_items.findMany({
          where: { company_id: String(company_id) },
          orderBy: { name: 'asc' }
        });
        res.status(200).json({ success: true, data: items });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const newItem = await prisma.inventory_items.create({
          data: {
            ...req.body,
            // We might need to generate a unique string ID if not provided, or let user provide it
            // For now, let's assume ID is provided or generated on client for the string ID field
            stock: parseInt(req.body.stock),
            costPrice: parseFloat(req.body.costPrice),
            salePrice: parseFloat(req.body.salePrice),
          },
        });
        res.status(201).json({ success: true, data: newItem });
      } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}