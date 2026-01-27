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
    let businessIds = [];
    let isOwnerView = viewAll === 'true';

    if (isOwnerView) {
      // Super Owner viewing all - get all businesses
      const allBusinesses = await prisma.business.findMany({
        where: { isActive: true },
        select: { id: true, name: true, shortName: true, type: true }
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

    // For now, return enhanced demo data
    // This will be replaced with real data when we implement the modules
    const dashboardData = isOwnerView 
      ? getOwnerDashboardData() 
      : getCompanyDashboardData(businessId);

    res.status(200).json({ success: true, data: dashboardData });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Empty dashboard structure
function getEmptyDashboard() {
  return {
    stats: [],
    cashPulse: {},
    operationalSnapshot: {},
    liabilityWatch: {},
    companies: [],
    revenueChart: { labels: [], data: [] }
  };
}

// Owner Dashboard Data (Combined View)
function getOwnerDashboardData() {
  return {
    // Cash & Bank Pulse
    cashPulse: {
      dayStartBalance: 285000,
      cashInToday: 1250000,
      cashOutToday: 350000,
      cashInHand: 1185000,
      totalBankBalance: 4500000
    },
    
    // Operational Snapshot
    operationalSnapshot: {
      totalFuelLiftingLitres: 25000,
      totalFuelLiftingValue: 3125000,
      totalSalesValue: 1485000,
      creditGivenToday: 180000,
      creditRecoveredToday: 95000,
      currentOutstanding: 875000
    },
    
    // Liability Watch
    liabilityWatch: {
      depotPayable: 4500000,
      supplierPayable: 850000,
      totalDebtors: 875000,
      depots: [
        { name: 'Padma Oil', amount: 2100000 },
        { name: 'Meghna Petroleum', amount: 1500000 },
        { name: 'Jamuna Oil', amount: 900000 }
      ]
    },
    
    // Company Breakdown
    companies: [
      {
        name: 'ARS Corporation',
        type: 'PETROL_PUMP',
        todaySales: 985000,
        cashInHand: 785000,
        receivables: 525000
      },
      {
        name: 'ARS Lube',
        type: 'LUBRICANT',
        todaySales: 500000,
        cashInHand: 400000,
        receivables: 350000
      }
    ],
    
    // Legacy stats for existing components
    stats: [
      { name: 'Total Cash', value: 1185000, icon: 'BanknotesIcon' },
      { name: "Today's Sales", value: 1485000, icon: 'ArrowUpIcon' },
      { name: 'Receivables', value: 875000, icon: 'ArrowDownIcon' },
      { name: 'Payables', value: 5350000, icon: 'ArrowDownIcon' },
    ],
    
    revenueChart: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      data: [2500000, 2760000, 2840000, 2360000, 3120000, 3440000, 3300000, 3780000, 3560000, 3900000, 4200000, 3700000]
    },
    
    profitability: { grossMargin: 18.5, netMargin: 8.2 },
    currentRatio: { ratio: 1.35 },
    topExpenses: [
      { name: 'Fuel Purchase (Depot)', amount: 25000000, percentage: 65 },
      { name: 'Staff Salaries', amount: 900000, percentage: 12 },
      { name: 'Electricity', amount: 170000, percentage: 8 },
      { name: 'Maintenance', amount: 130000, percentage: 6 },
      { name: 'Transport', amount: 90000, percentage: 5 },
    ],
    revenueSources: { 
      labels: ['Petrol', 'Diesel', 'Octane', 'Lubricants', 'Gas Cylinders'],
      data: [45, 35, 8, 7, 5]
    }
  };
}

// Company-specific Dashboard Data
function getCompanyDashboardData(businessId) {
  const isArsLube = businessId && businessId.includes('LUBE');
  const multiplier = isArsLube ? 0.6 : 1;
  
  return {
    cashPulse: {
      dayStartBalance: 150000 * multiplier,
      cashInToday: 650000 * multiplier,
      cashOutToday: 180000 * multiplier,
      cashInHand: 620000 * multiplier,
      totalBankBalance: 2200000 * multiplier
    },
    
    operationalSnapshot: {
      totalFuelLiftingLitres: isArsLube ? 0 : 15000,
      totalFuelLiftingValue: isArsLube ? 0 : 1875000,
      totalSalesValue: 785000 * multiplier,
      creditGivenToday: 95000 * multiplier,
      creditRecoveredToday: 50000 * multiplier,
      currentOutstanding: 450000 * multiplier
    },
    
    liabilityWatch: {
      depotPayable: isArsLube ? 0 : 2800000,
      supplierPayable: isArsLube ? 850000 : 250000,
      totalDebtors: 450000 * multiplier,
      depots: isArsLube ? [] : [
        { name: 'Padma Oil', amount: 1200000 },
        { name: 'Meghna Petroleum', amount: 900000 },
        { name: 'Jamuna Oil', amount: 700000 }
      ]
    },
    
    stats: [
      { name: 'Cash in Hand', value: 620000 * multiplier, icon: 'BanknotesIcon' },
      { name: "Today's Sales", value: 785000 * multiplier, icon: 'ArrowUpIcon' },
      { name: 'Receivables', value: 450000 * multiplier, icon: 'ArrowDownIcon' },
      { name: 'Payables', value: (isArsLube ? 850000 : 3050000), icon: 'ArrowDownIcon' },
    ],
    
    revenueChart: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      data: [1250000, 1380000, 1420000, 1180000, 1560000, 1720000, 1650000, 1890000, 1780000, 1950000, 2100000, 1850000].map(v => v * multiplier)
    },
    
    profitability: { grossMargin: isArsLube ? 22 : 16, netMargin: isArsLube ? 10 : 7 },
    currentRatio: { ratio: 1.35 },
    topExpenses: [
      { name: isArsLube ? 'Lubricant Purchase' : 'Fuel Purchase (Depot)', amount: 12500000 * multiplier, percentage: 65 },
      { name: 'Staff Salaries', amount: 450000 * multiplier, percentage: 12 },
      { name: 'Electricity', amount: 85000 * multiplier, percentage: 8 },
      { name: 'Maintenance', amount: 65000 * multiplier, percentage: 6 },
      { name: 'Transport', amount: 45000 * multiplier, percentage: 5 },
    ],
    revenueSources: isArsLube 
      ? { labels: ['Motor Oil', 'Hydraulic', 'Gear Oil', 'Grease', 'Others'], data: [40, 25, 20, 10, 5] }
      : { labels: ['Petrol', 'Diesel', 'Octane', 'Lubricants', 'Gas Cylinders'], data: [45, 35, 8, 7, 5] }
  };
}