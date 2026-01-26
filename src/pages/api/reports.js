// src/pages/api/reports.js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { companyId, type } = req.query;

  if (!companyId || !type) {
    return res.status(400).json({ error: 'Company ID and Report Type are required' });
  }

  try {
    // Map query type to database column name
    const columnMap = {
      'balance-sheet': 'balance_sheet',
      'income-statement': 'income_statement',
      'cash-flow': 'cash_flow',
      'trial-balance': 'trial_balance',
    };

    const dbColumn = columnMap[type];

    if (!dbColumn) {
      return res.status(400).json({ error: 'Invalid report type' });
    }

    // Dynamic selection
    const selectQuery = {};
    selectQuery[dbColumn] = true;

    const company = await prisma.companies.findUnique({
      where: { id: companyId },
      select: selectQuery
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    return res.status(200).json(company[dbColumn] || {});
  } catch (error) {
    console.error(`Error fetching report ${type}:`, error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}