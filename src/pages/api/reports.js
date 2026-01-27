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

    // --- 1. Fetch Live Data for Calculations ---
    
    // Revenue (Sum of Sales)
    const salesAgg = await prisma.sales.aggregate({
      where: { company_id: String(companyId) },
      _sum: { amount: true }
    });
    const totalRevenue = Number(salesAgg._sum.amount || 0);

    // COGS (Sum of Purchases)
    const purchasesAgg = await prisma.purchases.aggregate({
      where: { company_id: String(companyId) },
      _sum: { amount: true }
    });
    const totalPurchases = Number(purchasesAgg._sum.amount || 0);

    // Inventory Value
    const inventoryItems = await prisma.inventory_items.findMany({
      where: { company_id: String(companyId) }
    });
    const inventoryValue = inventoryItems.reduce((sum, item) => sum + (Number(item.stock) * Number(item.costPrice)), 0);

    // Fixed Assets
    const assetsAgg = await prisma.fixed_assets.aggregate({
      where: { company_id: String(companyId) },
      _sum: { bookValue: true, depreciation: true }
    });
    const totalFixedAssets = Number(assetsAgg._sum.bookValue || 0);
    const totalDepreciation = Number(assetsAgg._sum.depreciation || 0);

    // Debtors & Creditors
    const debtorsAgg = await prisma.debtors.aggregate({
      where: { company_id: String(companyId) },
      _sum: { amount: true }
    });
    const totalReceivables = Number(debtorsAgg._sum.amount || 0);

    const creditorsAgg = await prisma.creditors.aggregate({
      where: { company_id: String(companyId) },
      _sum: { amount: true }
    });
    const totalPayables = Number(creditorsAgg._sum.amount || 0);

    // Expenses (from Chart of Accounts or mock calc)
    const expenses = await prisma.chart_of_accounts.findMany({
        where: { company_id: String(companyId), type: 'Expense' }
    });
    const totalOperatingExpenses = expenses.reduce((sum, acc) => sum + Number(acc.balance), 0);

    // Cash (from Chart of Accounts)
    const cashAccounts = await prisma.chart_of_accounts.findMany({
        where: { company_id: String(companyId), type: 'Asset', name: { contains: 'Cash' } }
    });
    const totalCash = cashAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0);


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