// src/pages/api/chart-of-accounts/index.js
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

// Map database accountType to display type
const typeMapping = {
  'ASSET': 'Asset',
  'LIABILITY': 'Liability',
  'EQUITY': 'Equity',
  'REVENUE': 'Income',
  'EXPENSE': 'Expense',
};

// Reverse map for saving
const reverseTypeMapping = {
  'Asset': 'ASSET',
  'Liability': 'LIABILITY',
  'Equity': 'EQUITY',
  'Income': 'REVENUE',
  'Expense': 'EXPENSE',
};

async function handler(req, res) {
  const { method } = req;
  const { company_id } = req.query;

  try {
    switch (method) {
      case 'GET':
        if (!company_id) return res.status(400).json({ success: false, message: 'Company ID required' });
        const accounts = await prisma.chartOfAccount.findMany({
          where: { businessId: String(company_id), isActive: true },
          orderBy: { code: 'asc' }
        });
        // Map accountType to type for frontend
        const mappedAccounts = accounts.map(a => ({
          id: a.id,
          code: a.code,
          name: a.name,
          type: typeMapping[a.accountType] || a.accountType,
          balance: Number(a.balance),
          isSystem: a.isSystem,
        }));
        res.status(200).json({ success: true, data: mappedAccounts });
        break;

      case 'POST':
        const { id, type, ...dataToSave } = req.body;
        const newAccount = await prisma.chartOfAccount.create({
          data: {
            businessId: String(req.body.company_id),
            code: req.body.code,
            name: req.body.name,
            accountType: reverseTypeMapping[type] || req.body.accountType || 'EXPENSE',
            balance: parseFloat(req.body.balance || 0),
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

export default withAuth(handler, ['USER', 'MANAGER', 'ADMIN', 'CASHIER']);
