// src/pages/api/chart-of-accounts/index.js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { company_id } = req.query;

  try {
    switch (method) {
      case 'GET':
        if (!company_id) return res.status(400).json({ success: false, message: 'Company ID required' });
        const accounts = await prisma.chart_of_accounts.findMany({
          where: { company_id: String(company_id) },
          orderBy: { code: 'asc' }
        });
        res.status(200).json({ success: true, data: accounts });
        break;

      case 'POST':
        // id is auto-increment, do not include it
        const { id, ...dataToSave } = req.body;
        const newAccount = await prisma.chart_of_accounts.create({
          data: {
            ...dataToSave,
            code: parseInt(req.body.code),
            balance: parseFloat(req.body.balance),
          },
        });
        res.status(201).json({ success: true, data: newAccount });
        break;

      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}