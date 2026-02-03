// src/pages/api/reports.js
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
  const { companyId, type } = req.query;

  if (!companyId || !type) {
    return res.status(400).json({ error: 'Company ID and Report Type are required' });
  }

  try {
    const company = await prisma.business.findUnique({ where: { id: String(companyId) } });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    // Date Filtering Logic
    const { startDate, endDate } = req.query;
    let dateFilter = {};

    if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
        }
      };
    }

    // --- 1. Fetch Live Data for Calculations (with fallbacks for missing data) ---

    // Revenue (Sum of Sales)
    let totalRevenue = 0;
    try {
      const salesAgg = await prisma.sales.aggregate({
        where: { company_id: String(companyId), ...dateFilter },
        _sum: { amount: true }
      });
      totalRevenue = Number(salesAgg._sum.amount || 0);
    } catch (e) { console.log('Sales aggregate error:', e.message); }

    // COGS (Sum of Purchases)
    let totalPurchases = 0;
    try {
      const purchasesAgg = await prisma.purchases.aggregate({
        where: { company_id: String(companyId), ...dateFilter },
        _sum: { amount: true }
      });
      totalPurchases = Number(purchasesAgg._sum.amount || 0);
    } catch (e) { console.log('Purchases aggregate error:', e.message); }

    // Inventory Value (Snapshot, typically not date filtered unless historical tracking exists)
    // For now, Inventory Value is "Current", so we DO NOT apply date filter unless user wants "Assets received in this period"
    // Standard accounting practice: Balance Sheet items are "As At". P&L items are "For Period".
    // Decision: Keep Inventory as CURRENT value for Balance Sheet. 
    // BUT for reports like "Inventory Movement", date would matter. 
    // For simplicity in this dashboard, let's keep Inventory as CURRENT Value.
    let inventoryValue = 0;
    try {
      const inventoryItems = await prisma.inventory_items.findMany({
        where: { company_id: String(companyId) }
      });
      inventoryValue = inventoryItems.reduce((sum, item) => sum + (Number(item.stock || 0) * Number(item.costPrice || 0)), 0);
    } catch (e) { console.log('Inventory error:', e.message); }

    // Fixed Assets (Current Value)
    let totalFixedAssets = 0;
    let totalDepreciation = 0;
    try {
      const assetsAgg = await prisma.fixedAsset.aggregate({
        _sum: { bookValue: true, accumulatedDepreciation: true }
      });
      totalFixedAssets = Number(assetsAgg._sum.bookValue || 0);
      totalDepreciation = Number(assetsAgg._sum.accumulatedDepreciation || 0);
    } catch (e) { console.log('Fixed assets error:', e.message); }

    // Debtors & Creditors (Current Outstanding)
    // Filtering Debtor/Creditor Balances by date is tricky (requires analyzing all transaction history).
    // For MVP, we usually show CURRENT outstanding.
    // However, for "Sales in Period" vs "Cash Collected in Period" etc., we need to be careful.
    // Let's stick to Current Balances for Balance Sheet items.
    let totalReceivables = 0;
    try {
      const debtorsAgg = await prisma.sundry_debtors.aggregate({
        where: { company_id: String(companyId) },
        _sum: { amount: true }
      });
      totalReceivables = Number(debtorsAgg._sum.amount || 0);
    } catch (e) { console.log('Debtors error:', e.message); }

    let totalPayables = 0;
    try {
      const creditorsAgg = await prisma.sundry_creditors.aggregate({
        where: { company_id: String(companyId) },
        _sum: { amount: true }
      });
      totalPayables = Number(creditorsAgg._sum.amount || 0);
    } catch (e) { console.log('Creditors error:', e.message); }

    // Expenses (from Chart of Accounts or mock calc)
    // Expenses SHOULD be filtered by date if they are transactional. 
    // IF ChartOfAccount tracks specific transactions, we filter. 
    // Currently ChartOfAccount is a balance. 
    // TODO: Ideally we should query a "Transactions" table for expenses. 
    // Since we don't have a dedicated General Ledger yet, we serve the 'balance' field.
    // This limitation means Date Filtering on Expenses won't work perfectly until we have a Ledger.
    // For now, we return the current balance.
    let expenses = [];
    let totalOperatingExpenses = 0;
    try {
      expenses = await prisma.chartOfAccount.findMany({
        where: { businessId: String(companyId), accountType: 'EXPENSE' }
      });
      totalOperatingExpenses = expenses.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
    } catch (e) { console.log('ChartOfAccount error:', e.message); }

    // Cash (Current Balance)
    let totalCash = 0;
    try {
      const cashAccounts = await prisma.chartOfAccount.findMany({
        where: { businessId: String(companyId), accountType: 'ASSET', name: { contains: 'Cash' } }
      });
      totalCash = cashAccounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
    } catch (e) { console.log('Cash accounts error:', e.message); }


    // --- 2. Build Response Objects ---

    let reportData = {};
    const dateStr = `As of ${new Date().toLocaleDateString()}`;

    // INCOME STATEMENT
    if (type === 'income-statement') {
      const grossProfit = totalRevenue - totalPurchases;
      // Mocking breakdown if data not granular
      const adminExp = totalOperatingExpenses * 0.6;
      const sellingExp = totalOperatingExpenses * 0.4;

      reportData = {
        date: dateStr,
        revenue: { name: "Sales Revenue", amount: totalRevenue },
        costOfGoodsSold: { name: "Cost of Goods Sold", amount: totalPurchases },
        expenses: {
          administrative: { name: "Administrative Expenses", amount: adminExp },
          selling: { name: "Selling & Dist. Expenses", amount: sellingExp },
          financial: { name: "Financial Expenses", amount: 0 }, // Add if you have loan interest
        },
        otherIncome: { name: "Other Income", amount: 0 }
      };
    }
    // BALANCE SHEET
    else if (type === 'balance-sheet') {
      // Equity = Assets - Liabilities
      const totalAssets = totalFixedAssets + inventoryValue + totalReceivables + totalCash;
      const totalLiabilities = totalPayables;
      const equity = totalAssets - totalLiabilities;

      reportData = {
        date: dateStr,
        assets: {
          nonCurrent: [
            { name: "Property, Plant & Equipment", amount: totalFixedAssets }
          ],
          current: [
            { name: "Inventories", amount: inventoryValue },
            { name: "Accounts Receivable", amount: totalReceivables },
            { name: "Cash & Cash Equivalents", amount: totalCash || 50000 }, // Fallback if 0
          ]
        },
        liabilities: {
          nonCurrent: [
            { name: "Long Term Loans", amount: 0 }
          ],
          current: [
            { name: "Accounts Payable", amount: totalPayables }
          ]
        },
        equity: [
          { name: "Owner's Equity", amount: equity }
        ]
      };
    }
    // CASH FLOW
    else if (type === 'cash-flow') {
      const netProfit = (totalRevenue - totalPurchases) - totalOperatingExpenses;

      reportData = {
        date: dateStr,
        openingCash: 100000, // Mock opening
        operating: [
          { name: "Net Profit before Tax", amount: netProfit },
          { name: "Depreciation", amount: totalDepreciation },
          { name: "(Increase)/Decrease in Inventory", amount: -(inventoryValue * 0.1) }, // Mock change
          { name: "(Increase)/Decrease in Receivables", amount: -(totalReceivables * 0.05) },
          { name: "Increase/(Decrease) in Payables", amount: (totalPayables * 0.05) }
        ],
        investing: [
          { name: "Purchase of Fixed Assets", amount: -50000 } // Mock
        ],
        financing: [
          { name: "Loan Repayment", amount: 0 }
        ]
      };
    }
    // TRIAL BALANCE
    else if (type === 'trial-balance') {
      const accounts = [];

      // Add dynamic accounts
      accounts.push({ name: 'Sales Revenue', debit: 0, credit: totalRevenue });
      accounts.push({ name: 'Purchases (COGS)', debit: totalPurchases, credit: 0 });
      accounts.push({ name: 'Inventory', debit: inventoryValue, credit: 0 });
      accounts.push({ name: 'Accounts Receivable', debit: totalReceivables, credit: 0 });
      accounts.push({ name: 'Accounts Payable', debit: 0, credit: totalPayables });
      accounts.push({ name: 'Fixed Assets', debit: totalFixedAssets, credit: 0 });
      accounts.push({ name: 'Cash & Bank', debit: totalCash, credit: 0 });

      // Add expenses
      expenses.forEach(exp => {
        accounts.push({ name: exp.name, debit: Number(exp.balance), credit: 0 });
      });

      // Balancing figure (Equity)
      const totalDebits = accounts.reduce((sum, a) => sum + a.debit, 0);
      const totalCredits = accounts.reduce((sum, a) => sum + a.credit, 0);
      const equity = totalDebits - totalCredits;

      accounts.push({ name: "Capital / Retained Earnings", debit: 0, credit: equity });

      reportData = {
        date: dateStr,
        accounts: accounts
      };
    }

    return res.status(200).json(reportData);

  } catch (error) {
    console.error(`Error fetching report ${type}:`, error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
