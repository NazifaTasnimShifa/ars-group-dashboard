// src/pages/api/dashboard.js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { company_id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!company_id) {
    return res.status(400).json({ success: false, message: 'Company ID required' });
  }

  try {
    // 1. Fetch Company Info
    const company = await prisma.companies.findUnique({
      where: { id: String(company_id) },
    });

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // 2. Calculate Live Stats
    
    // Total Sales Revenue (Sum of all sales amounts)
    const salesAgg = await prisma.sales.aggregate({
      where: { company_id: String(company_id) },
      _sum: { amount: true }
    });
    const totalRevenue = salesAgg._sum.amount || 0;

    // Sales Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySalesAgg = await prisma.sales.aggregate({
      where: { 
        company_id: String(company_id),
        date: { gte: today }
      },
      _sum: { amount: true }
    });
    const salesToday = todaySalesAgg._sum.amount || 0;

    // Total Receivables (Sum of Debtors)
    const debtorsAgg = await prisma.debtors.aggregate({
      where: { company_id: String(company_id) },
      _sum: { amount: true }
    });
    const totalReceivables = debtorsAgg._sum.amount || 0;

    // Total Payables (Sum of Creditors)
    const creditorsAgg = await prisma.creditors.aggregate({
      where: { company_id: String(company_id) },
      _sum: { amount: true }
    });
    const totalPayables = creditorsAgg._sum.amount || 0;

    // 3. Construct Data Object
    // We maintain the structure expected by the frontend
    const dashboardData = {
      stats: [
        { name: 'Total Revenue', value: Number(totalRevenue), icon: 'BanknotesIcon' },
        { name: "Today's Sales", value: Number(salesToday), icon: 'ArrowUpIcon' },
        { name: 'Total Receivables', value: Number(totalReceivables), icon: 'ArrowDownIcon' },
        { name: 'Total Payables', value: Number(totalPayables), icon: 'ArrowUpIcon' },
      ],
      // For specific charts (profitability, ratios), we can use placeholders or 
      // calculate them if we had a full General Ledger. 
      // For now, we return safe defaults or static data for complex charts.
      profitability: company.dashboard_stats?.profitability || { grossMargin: 0, netMargin: 0 },
      currentRatio: company.dashboard_stats?.currentRatio || { ratio: 0 },
      topExpenses: company.dashboard_stats?.topExpenses || [],
      revenueSources: company.dashboard_stats?.revenueSources || { labels: [], data: [] },
    };

    res.status(200).json({ success: true, data: dashboardData });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}