// src/pages/api/dashboard.js
// ARS ERP - Comprehensive Dashboard API

import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { businessId, viewAll } = req.query;

  try {
    const isOwnerView = viewAll === 'true';
    let businessIds = [];

    if (isOwnerView) {
      const allBusinesses = await prisma.business.findMany({
        where: { isActive: true },
        select: { id: true }
      });
      businessIds = allBusinesses.map(b => b.id);
    } else if (businessId) {
      businessIds = [businessId];
    } else {
      return res.status(200).json({ success: true, data: getEmptyDashboard() });
    }

    // Date helpers
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // --- 1. Sales Today ---
    const salesToday = await prisma.sales.aggregate({
      where: {
        company_id: { in: businessIds },
        date: { gte: today, lt: tomorrow }
      },
      _sum: { totalAmount: true },
      _count: true
    });

    // --- 2. Purchases This Month ---
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const purchasesMonth = await prisma.purchases.aggregate({
      where: {
        company_id: { in: businessIds },
        date: { gte: monthStart }
      },
      _sum: { amount: true }
    });

    // --- 3. Total Sales (All Time for Revenue) ---
    const totalSales = await prisma.sales.aggregate({
      where: { company_id: { in: businessIds } },
      _sum: { totalAmount: true }
    });

    // --- 4. Total Purchases (All Time for COGS) ---
    const totalPurchases = await prisma.purchases.aggregate({
      where: { company_id: { in: businessIds } },
      _sum: { amount: true }
    });

    // --- 5. Total Expenses ---
    const totalExpenses = await prisma.expenses.aggregate({
      where: { company_id: { in: businessIds } },
      _sum: { amount: true }
    });

    // --- 6. Top Expenses ---
    const topExpenses = await prisma.expenses.groupBy({
      by: ['category'],
      where: { company_id: { in: businessIds } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5
    });

    // --- 7. Revenue Sources (by product category) ---
    const revenueSources = await prisma.sale_items.groupBy({
      by: ['product_id'],
      where: {
        sale: { company_id: { in: businessIds } }
      },
      _sum: { price: true }
    });

    // Get product names for revenue sources
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

    // --- 8. Receivables (Sundry Debtors) ---
    const debtorsData = await prisma.sundry_debtors.aggregate({
      where: { company_id: { in: businessIds } },
      _sum: { amount: true }
    });

    // --- 9. Payables (Sundry Creditors) ---
    const creditorsData = await prisma.sundry_creditors.aggregate({
      where: { company_id: { in: businessIds } },
      _sum: { amount: true }
    });

    // --- Calculate Ratios ---
    const revenue = Number(totalSales._sum.totalAmount) || 0;
    const cogs = Number(totalPurchases._sum.amount) || 0;
    const expenses = Number(totalExpenses._sum.amount) || 0;
    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - expenses;

    const grossMargin = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(2) : 0;
    const netMargin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(2) : 0;

    // Current Ratio (Current Assets / Current Liabilities)
    // Simplified: Receivables / Payables
    const receivables = Number(debtorsData._sum.amount) || 0;
    const payables = Number(creditorsData._sum.amount) || 0;
    const currentRatioValue = payables > 0 ? (receivables / payables).toFixed(2) : 0;

    // --- Construct Response ---
    const dashboardData = {
      stats: [
        { name: 'Total Revenue', value: revenue, icon: 'BanknotesIcon' },
        { name: "Today's Sales", value: Number(salesToday._sum.totalAmount) || 0, icon: 'ArrowUpIcon' },
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
        cashInToday: Number(salesToday._sum.totalAmount) || 0,
        cashOutToday: 0,
        cashInHand: 0,
        totalBankBalance: 0
      },
      operationalSnapshot: {
        totalSalesValue: Number(salesToday._sum.totalAmount) || 0,
        currentOutstanding: receivables
      },
      liabilityWatch: {
        supplierPayable: payables,
        totalDebtors: receivables,
      },
      revenueChart: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: [0, 0, 0, 0, 0, revenue, 0, 0, 0, 0, 0, 0] // Placeholder - current month has data
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