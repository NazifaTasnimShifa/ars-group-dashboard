// src/pages/api/dashboard.js
// ARS ERP - Real Dashboard API
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
      // Super Owner - all active businesses
      const allBusinesses = await prisma.business.findMany({
        where: { isActive: true },
        select: { id: true }
      });
      businessIds = allBusinesses.map(b => b.id);
    } else if (businessId) {
      businessIds = [businessId];
    } else {
      // Default to user's business if not provided and not owner view
      // (This should be handled by the frontend passing businessId, but safe fallback)
      return res.status(200).json({ success: true, data: getEmptyDashboard() });
    }

    // Helper for date filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // --- 1. Fetch Financials (Cash & Bank) ---
    // Note: Assuming 'Cash' is a type of BankAccount or a specific account
    const bankAccounts = await prisma.bankAccount.findMany({
      where: {
        branch: { businessId: { in: businessIds } }
      }
    });

    const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + Number(acc.currentBalance), 0);
    // Approximate Cash in Hand from accounts named 'Cash' or similar, or just placeholder if not modeled
    const cashInHand = bankAccounts
      .filter(acc => acc.accountName.toLowerCase().includes('cash'))
      .reduce((sum, acc) => sum + Number(acc.currentBalance), 0);

    // --- 2. Sales Today ---
    // A. Fuel Sales
    const fuelSales = await prisma.fuelSale.aggregate({
      where: {
        shiftInstance: {
          shift: { branch: { businessId: { in: businessIds } } }
        },
        saleTime: { gte: today, lt: tomorrow }
      },
      _sum: { totalAmount: true }
    });

    // B. Generic Sales (Lube/Store)
    const genericSales = await prisma.sales.aggregate({
      where: {
        company_id: { in: businessIds },
        date: { gte: today, lt: tomorrow }
      },
      _sum: { totalAmount: true }
    });

    const totalSalesToday = (Number(fuelSales._sum.totalAmount) || 0) + (Number(genericSales._sum.totalAmount) || 0);

    // --- 3. Receivables & Payables (Liability Watch) ---
    // A. Sundry Debtors
    const sundryDebtors = await prisma.sundry_debtors.aggregate({
      where: { company_id: { in: businessIds } },
      _sum: { amount: true }
    });

    // B. Trade Debtors (Customers)
    const tradeDebtors = await prisma.customer.aggregate({
      where: { businessId: { in: businessIds } },
      _sum: { outstandingAmount: true }
    });

    const totalReceivables = (Number(sundryDebtors._sum.amount) || 0) + (Number(tradeDebtors._sum.outstandingAmount) || 0);

    // C. Sundry Creditors
    const sundryCreditors = await prisma.sundry_creditors.aggregate({
      where: { company_id: { in: businessIds } },
      _sum: { amount: true }
    });

    // D. Trade Creditors (Suppliers)
    const tradeCreditors = await prisma.supplier.aggregate({
      where: { businessId: { in: businessIds } },
      _sum: { outstandingAmount: true }
    });

    const totalPayables = (Number(sundryCreditors._sum.amount) || 0) + (Number(tradeCreditors._sum.outstandingAmount) || 0);

    // --- 4. Monthly Revenue (Chart Data) ---
    // Simplified: Just returning hardcoded array for chart to prevent crashing if no data exists
    // In production, we would use groupBy on sales tables
    const revenueChart = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // Placeholder
    };

    // --- 5. Construct Response ---
    const dashboardData = {
      cashPulse: {
        dayStartBalance: 0, // Needs shift opening logic
        cashInToday: totalSalesToday, // Approx
        cashOutToday: 0, // Needs expense logic
        cashInHand: cashInHand || 0,
        totalBankBalance: totalBankBalance || 0
      },
      operationalSnapshot: {
        totalFuelLiftingLitres: 0, // Needs receipt logic
        totalFuelLiftingValue: 0,
        totalSalesValue: totalSalesToday,
        creditGivenToday: 0,
        creditRecoveredToday: 0,
        currentOutstanding: totalReceivables
      },
      liabilityWatch: {
        depotPayable: 0, // Specific supplier type?
        supplierPayable: Number(tradeCreditors._sum.outstandingAmount) || 0,
        totalDebtors: totalReceivables,
        depots: []
      },
      // Stats for simplified view
      stats: [
        { name: 'Total Bank Balance', value: totalBankBalance, icon: 'BanknotesIcon' },
        { name: "Today's Sales", value: totalSalesToday, icon: 'ArrowUpIcon' },
        { name: 'Receivables', value: totalReceivables, icon: 'ArrowDownIcon' },
        { name: 'Payables', value: totalPayables, icon: 'ArrowDownIcon' },
      ],
      revenueChart: revenueChart,
      companies: [] // Could populate with per-business stats if needed
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
    cashPulse: { cashInHand: 0, totalBankBalance: 0 },
    operationalSnapshot: {},
    liabilityWatch: {},
    companies: [],
    revenueChart: { labels: [], data: [] }
  };
}

export default withAuth(handler, ['USER', 'MANAGER', 'ADMIN']);