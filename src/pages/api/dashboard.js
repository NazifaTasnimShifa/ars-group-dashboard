// src/pages/api/dashboard.js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { company_id } = req.query;

  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  if (!company_id) return res.status(400).json({ success: false, message: 'Company ID required' });

  try {
    const company = await prisma.companies.findUnique({ where: { id: String(company_id) } });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    // 1. Aggregates
    const salesAgg = await prisma.sales.aggregate({ where: { company_id: String(company_id) }, _sum: { amount: true } });
    const totalRevenue = Number(salesAgg._sum.amount || 0);

    const purchasesAgg = await prisma.purchases.aggregate({ where: { company_id: String(company_id) }, _sum: { amount: true } });
    const totalPurchases = Number(purchasesAgg._sum.amount || 0);

    const debtorsAgg = await prisma.debtors.aggregate({ where: { company_id: String(company_id) }, _sum: { amount: true } });
    const creditorsAgg = await prisma.creditors.aggregate({ where: { company_id: String(company_id) }, _sum: { amount: true } });

    // 2. Monthly Revenue Data (Simple JS grouping as Prisma groupBy can be tricky with Dates in some DBs)
    const allSales = await prisma.sales.findMany({
        where: { company_id: String(company_id) },
        select: { date: true, amount: true }
    });

    const monthlyRevenue = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize 0
    monthNames.forEach(m => monthlyRevenue[m] = 0);

    allSales.forEach(sale => {
        const d = new Date(sale.date);
        const month = monthNames[d.getMonth()];
        monthlyRevenue[month] += Number(sale.amount);
    });

    // 3. Construct Data
    const dashboardData = {
      stats: [
        { name: 'Total Revenue', value: totalRevenue, icon: 'BanknotesIcon' },
        { name: "Total Purchases", value: totalPurchases, icon: 'ArrowDownIcon' }, // Changed from Today's Sales for better context
        { name: 'Receivables', value: Number(debtorsAgg._sum.amount || 0), icon: 'ArrowDownIcon' },
        { name: 'Payables', value: Number(creditorsAgg._sum.amount || 0), icon: 'ArrowUpIcon' },
      ],
      revenueChart: {
          labels: monthNames,
          data: monthNames.map(m => monthlyRevenue[m])
      },
      // Keep static fallbacks for complex calc that require Expense Table
      profitability: company.dashboard_stats?.profitability || { grossMargin: 25, netMargin: 10 },
      currentRatio: company.dashboard_stats?.currentRatio || { ratio: 1.2 },
      topExpenses: company.dashboard_stats?.topExpenses || [],
      revenueSources: company.dashboard_stats?.revenueSources || { labels: [], data: [] },
    };

    res.status(200).json({ success: true, data: dashboardData });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}