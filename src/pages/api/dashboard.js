// src/pages/api/dashboard.js
// ARS ERP - Dashboard API with Owner View Support
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { businessId, viewAll } = req.query;

  try {
    // Determine which businesses to query
    let businessFilter = {};
    let businessIds = [];

    if (viewAll === 'true') {
      // Super Owner viewing all - get all businesses
      const allBusinesses = await prisma.business.findMany({
        where: { isActive: true },
        select: { id: true }
      });
      businessIds = allBusinesses.map(b => b.id);
    } else if (businessId) {
      // Specific business
      businessIds = [businessId];
    } else {
      // No filter provided - return empty
      return res.status(200).json({ 
        success: true, 
        data: getEmptyDashboard() 
      });
    }

    // For now, return demo data since the old tables don't exist in new schema
    // This will be replaced with real data when we implement the modules
    const dashboardData = getDemoDashboardData(viewAll === 'true');

    res.status(200).json({ success: true, data: dashboardData });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Empty dashboard structure
function getEmptyDashboard() {
  return {
    stats: [
      { name: 'Cash in Hand', value: 0, icon: 'BanknotesIcon' },
      { name: "Today's Sales", value: 0, icon: 'ArrowUpIcon' },
      { name: 'Receivables', value: 0, icon: 'ArrowDownIcon' },
      { name: 'Payables', value: 0, icon: 'ArrowDownIcon' },
    ],
    revenueChart: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    profitability: { grossMargin: 0, netMargin: 0 },
    currentRatio: { ratio: 0 },
    topExpenses: [],
    revenueSources: { labels: [], data: [] }
  };
}

// Demo data for development
function getDemoDashboardData(isCombined = false) {
  const multiplier = isCombined ? 2 : 1;
  
  return {
    stats: [
      { name: 'Cash in Hand', value: 285000 * multiplier, icon: 'BanknotesIcon' },
      { name: "Today's Sales", value: 485000 * multiplier, icon: 'ArrowUpIcon' },
      { name: 'Receivables', value: 875000 * multiplier, icon: 'ArrowDownIcon' },
      { name: 'Payables', value: 4500000 * multiplier, icon: 'ArrowDownIcon' },
    ],
    revenueChart: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      data: [
        1250000 * multiplier, 
        1380000 * multiplier, 
        1420000 * multiplier, 
        1180000 * multiplier, 
        1560000 * multiplier, 
        1720000 * multiplier, 
        1650000 * multiplier, 
        1890000 * multiplier, 
        1780000 * multiplier, 
        1950000 * multiplier, 
        2100000 * multiplier, 
        1850000 * multiplier
      ]
    },
    profitability: { 
      grossMargin: 18.5, 
      netMargin: 8.2 
    },
    currentRatio: { 
      ratio: 1.35 
    },
    topExpenses: [
      { name: 'Fuel Purchase (Depot)', amount: 12500000 * multiplier, percentage: 65 },
      { name: 'Staff Salaries', amount: 450000 * multiplier, percentage: 12 },
      { name: 'Electricity', amount: 85000 * multiplier, percentage: 8 },
      { name: 'Maintenance', amount: 65000 * multiplier, percentage: 6 },
      { name: 'Transport', amount: 45000 * multiplier, percentage: 5 },
    ],
    revenueSources: { 
      labels: ['Petrol', 'Diesel', 'Octane', 'Lubricants', 'Gas Cylinders'],
      data: [45, 35, 8, 7, 5]
    }
  };
}