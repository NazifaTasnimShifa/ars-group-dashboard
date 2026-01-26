// src/pages/api/data.js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { companyId, type } = req.query;

  if (!companyId || !type) {
    return res.status(400).json({ error: 'Company ID and Type are required' });
  }

  try {
    let data = [];

    // Switch based on the requested data type to query the correct table
    switch (type) {
      case 'debtors':
        data = await prisma.debtors.findMany({ where: { company_id: companyId } });
        break;
      case 'creditors':
        data = await prisma.creditors.findMany({ where: { company_id: companyId } });
        break;
      case 'inventory':
        data = await prisma.inventory_items.findMany({ where: { company_id: companyId } });
        break;
      case 'sales':
        data = await prisma.sales.findMany({ where: { company_id: companyId } });
        break;
      case 'purchases':
        data = await prisma.purchases.findMany({ where: { company_id: companyId } });
        break;
      case 'fixed-assets':
        data = await prisma.fixed_assets.findMany({ where: { company_id: companyId } });
        break;
      case 'process-loss':
        data = await prisma.process_loss.findMany({ where: { company_id: companyId } });
        break;
      case 'chart-of-accounts':
        data = await prisma.chart_of_accounts.findMany({ where: { company_id: companyId } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid data type' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}