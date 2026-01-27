// src/pages/api/reports.js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { companyId, type } = req.query;

  if (!companyId || !type) {
    return res.status(400).json({ error: 'Company ID and Report Type are required' });
  }

  try {
    const company = await prisma.companies.findUnique({ where: { id: String(companyId) } });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    // 1. Calculate Aggregates
    // Total Revenue (Sales)
    const salesAgg = await prisma.sales.aggregate({
      where: { company_id: String(companyId) },
      _sum: { amount: true }
    });
    const revenue = Number(salesAgg._sum.amount || 0);

    // Total COGS/Purchases
    const purchasesAgg = await prisma.purchases.aggregate({
      where: { company_id: String(companyId) },
      _sum: { amount: true }
    });
    const purchases = Number(purchasesAgg._sum.amount || 0);

    // Inventory Value
    const inventoryItems = await prisma.inventory_items.findMany({
      where: { company_id: String(companyId) }
    });
    const inventoryValue = inventoryItems.reduce((acc, item) => acc + (Number(item.stock) * Number(item.costPrice)), 0);

    // Fixed Assets Value
    const assetsAgg = await prisma.fixed_assets.aggregate({
      where: { company_id: String(companyId) },
      _sum: { bookValue: true }
    });
    const fixedAssets = Number(assetsAgg._sum.bookValue || 0);

    // Accounts Receivable (Debtors)
    const debtorsAgg = await prisma.debtors.aggregate({
      where: { company_id: String(companyId) },
      _sum: { amount: true }
    });
    const receivables = Number(debtorsAgg._sum.amount || 0);

    // Accounts Payable (Creditors)
    const creditorsAgg = await prisma.creditors.aggregate({
      where: { company_id: String(companyId) },
      _sum: { amount: true }
    });
    const payables = Number(creditorsAgg._sum.amount || 0);

    // --- Generate Report Data ---

    let reportData = {};

    if (type === 'income-statement') {
      // Simple Income Statement Logic
      // Revenue - Purchases = Gross Profit (Simplified)
      // Gross Profit - Expenses (assumed 20% of sales for demo) = Net Profit
      const operatingExpenses = Math.round(revenue * 0.15); // Mock estimation for demo
      const grossProfit = revenue - purchases;
      const netProfit = grossProfit - operatingExpenses;

      reportData = {
        date: `As of ${new Date().toLocaleDateString()}`,
        revenue: { name: "Sales Revenue", amount: revenue },
        costOfGoodsSold: { name: "Cost of Goods Sold (Purchases)", amount: purchases },
        expenses: {
          administrative: { name: "Est. Admin Expenses", amount: Math.round(operatingExpenses * 0.6) },
          selling: { name: "Est. Selling Expenses", amount: Math.round(operatingExpenses * 0.4) },
          financial: { name: "Financial Expenses", amount: 0 },
        },
        otherIncome: { name: "Other Income", amount: 0 }
      };
    } 
    else if (type === 'balance-sheet') {
      // Simple Balance Sheet Logic
      // Assets = Fixed Assets + Inventory + Receivables + Cash (Derived)
      // Liabilities = Payables + Loans
      // Equity = Assets - Liabilities
      
      const cashOnHand = Math.max(50000, (revenue - purchases - 200000)); // Mock cash calculation
      const totalCurrentAssets = inventoryValue + receivables + cashOnHand;
      const totalAssets = fixedAssets + totalCurrentAssets;
      const totalLiabilities = payables; // Simplified
      const equity = totalAssets - totalLiabilities;

      reportData = {
        date: `As of ${new Date().toLocaleDateString()}`,
        assets: {
          nonCurrent: [
            { name: "Property, Plant & Equipment", amount: fixedAssets }
          ],
          current: [
            { name: "Inventories", amount: inventoryValue },
            { name: "Accounts Receivable", amount: receivables },
            { name: "Cash & Cash Equivalents", amount: cashOnHand },
          ],
        },
        liabilities: {
          nonCurrent: [
            { name: "Long Term Loans", amount: 0 }
          ],
          current: [
            { name: "Accounts Payable", amount: payables },
            { name: "Tax Payable", amount: 0 },
          ],
        },
        equity: [
          { name: "Owners Equity", amount: equity }
        ]
      };
    }
    // Fallback for other reports to return empty safe objects
    else {
        reportData = { date: new Date().toLocaleDateString(), operating: [], investing: [], financing: [], accounts: [] };
    }

    return res.status(200).json(reportData);

  } catch (error) {
    console.error(`Error fetching report ${type}:`, error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}