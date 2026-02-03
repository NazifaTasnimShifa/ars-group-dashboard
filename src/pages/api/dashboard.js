// src/pages/api/dashboard.js
// ARS ERP - Comprehensive Dashboard API

import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { company_id, viewAll, startDate, endDate } = req.query;

  try {
    const isOwnerView = viewAll === 'true';
    let businessIds = [];

    if (isOwnerView) {
      const allBusinesses = await prisma.business.findMany({
        where: { isActive: true },
        select: { id: true }
      });
      businessIds = allBusinesses.map(b => b.id);
    } else if (company_id) {
      businessIds = [company_id];
    } else {
      return res.status(200).json({ success: true, data: getEmptyDashboard() });
    }

    // --- Date Filtering Logic ---
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
        }
      };
    } else {
        // Default to Current Month if no dates provided (matches Frontend default)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = {
            date: {
                gte: startOfMonth,
                lte: now
            }
        };
    }

    // --- 1. Sales (Revenue) in Period ---
    const salesData = await prisma.sales.aggregate({
      where: {
        company_id: { in: businessIds },
        ...dateFilter
      },
      _sum: { totalAmount: true },
      _count: true
    });

    // --- 2. Purchases in Period ---
    const purchasesData = await prisma.purchases.aggregate({
      where: {
        company_id: { in: businessIds },
        ...dateFilter
      },
      _sum: { amount: true }
    });

    // --- 3. Expenses in Period ---
    const expensesData = await prisma.expenses.aggregate({
      where: {
        company_id: { in: businessIds },
        ...dateFilter
      },
      _sum: { amount: true }
    });

    // --- 4. Top Expenses in Period ---
    const topExpenses = await prisma.expenses.groupBy({
      by: ['category'],
      where: { 
          company_id: { in: businessIds },
          ...dateFilter
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5
    });

    // --- 5. Revenue Sources in Period ---
    const revenueSources = await prisma.sale_items.groupBy({
      by: ['product_id'],
      where: {
        sale: { 
            company_id: { in: businessIds },
            ...dateFilter
        }
      },
      _sum: { price: true }
    });

    // Get product details
    const productIds = revenueSources.map(r => r.product_id);
    const products = await prisma.inventory_items.findMany({
      where: { id: { in: productIds } },
      select: { id: true, category: true }
    });

    const categoryMap = {};
    for (const p of products) {
      categoryMap[p.id] = p.category || 'Other';
    }

    const revenueByCategory = {};
    for (const r of revenueSources) {
      const cat = categoryMap[r.product_id] || 'Other';
      revenueByCategory[cat] = (revenueByCategory[cat] || 0) + Number(r._sum.price || 0);
    }

    // --- 6. Receivables (Snapshot - Always All Time) ---
    const debtorsData = await prisma.sundry_debtors.aggregate({
      where: { company_id: { in: businessIds } },
      _sum: { amount: true }
    });

    // --- 7. Payables (Snapshot - Always All Time) ---
    const creditorsData = await prisma.sundry_creditors.aggregate({
      where: { company_id: { in: businessIds } },
      _sum: { amount: true }
    });

    // --- Calculations ---
    const revenue = Number(salesData._sum.totalAmount) || 0;
    const purchases = Number(purchasesData._sum.amount) || 0;
    const expenses = Number(expensesData._sum.amount) || 0;
    
    // Simple Gross Profit (Revenue - Purchases). note: Accounting-wise this should be COGS, 
    // but assuming Purchases ~ COGS for simple dashboard or we'd need opening/closing stock. 
    // Sticking to simplified logic: GP = Revenue - Purchases
    const grossProfit = revenue - purchases;
    const netProfit = grossProfit - expenses;

    const grossMargin = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(2) : 0;
    const netMargin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(2) : 0;

    const receivables = Number(debtorsData._sum.amount) || 0;
    const payables = Number(creditorsData._sum.amount) || 0;
    const currentRatioValue = payables > 0 ? (receivables / payables).toFixed(2) : 0;

    // --- 8. Sales Target (From Business Settings) ---
    // Fetch settings for the first business in the list (or aggregate if multiple - simplified to first/sum for now)
    // For proper multi-business, we'd sum targets.
    const businessesWithSettings = await prisma.business.findMany({
        where: { id: { in: businessIds } },
        select: { settings: true }
    });
    
    let totalTarget = 0;
    businessesWithSettings.forEach(b => {
        const settings = b.settings || {};
        totalTarget += Number(settings.salesTarget || 10000000); // Default 1 Crore if not set
    });
    
    // --- 9. Cash Flow Calculations ---
    const operatingCashFlow = revenue - purchases - expenses;

    // --- Construct Response ---
    const dashboardData = {
      stats: [
        { name: 'Revenue', value: revenue, icon: 'BanknotesIcon' },
        { name: 'Purchases', value: purchases, icon: 'ArrowUpIcon' }, 
        { name: 'Receivables', value: receivables, icon: 'ArrowDownIcon' },
        { name: 'Payables', value: payables, icon: 'ArrowDownIcon' },
      ],
      profitability: {
        grossMargin: parseFloat(grossMargin),
        netMargin: parseFloat(netMargin),
      },
      currentRatio: {
        ratio: parseFloat(currentRatioValue),
      },
      topExpenses: topExpenses.map(e => ({
        name: e.category,
        amount: Number(e._sum.amount) || 0
      })),
      revenueSources: {
        labels: Object.keys(revenueByCategory),
        data: Object.values(revenueByCategory),
      },
      cashPulse: {
        cashInToday: revenue, 
        cashOutToday: expenses, 
        cashInHand: 0,
        totalBankBalance: 0
      },
      cashFlow: {
          operating: operatingCashFlow,
          investing: 0, // Placeholder
          financing: 0  // Placeholder
      },
      salesPerformance: {
          achieved: revenue,
          target: totalTarget
      },
      operationalSnapshot: {
        totalSalesValue: revenue,
        currentOutstanding: receivables
      },
      liabilityWatch: {
        supplierPayable: payables,
        totalDebtors: receivables,
      },
      revenueChart: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: [0, 0, 0, 0, 0, revenue, 0, 0, 0, 0, 0, 0] 
      },
      companies: []
    };

    res.status(200).json({ success: true, data: dashboardData });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

function getEmptyDashboard() {
  return {
    stats: [],
    profitability: { grossMargin: 0, netMargin: 0 },
    currentRatio: { ratio: 0 },
    topExpenses: [],
    revenueSources: { labels: [], data: [] },
    cashPulse: { cashInHand: 0, totalBankBalance: 0 },
    operationalSnapshot: {},
    liabilityWatch: {},
    companies: [],
    revenueChart: { labels: [], data: [] }
  };
}

export default withAuth(handler, ['USER', 'MANAGER', 'ADMIN', 'CASHIER']);
