// src/data/mockData.js

export const user = {
  id: 'user01',
  name: 'ARS group Admin',
  email: 'admin@arsgroup.com',
};

export const companies = [
  {
    id: 'ars_lube',
    name: 'ARS Lube LTD BD',
    shortName: 'ARS Lube',
  },
  {
    id: 'ars_corp',
    name: 'ARS Corporation',
    shortName: 'ARS Corp',
  },
];

// --- NEW: Company-Specific Dashboard Data ---

export const dashboardData = {
  ars_lube: {
    stats: [
      { name: 'Opening Balance (2023)', value: 20701199, icon: 'BanknotesIcon' },
      { name: 'Current Balance (2024)', value: 14591956, icon: 'BanknotesIcon' },
      { name: 'Today\'s Fuel Sale', value: 65200, icon: 'ArrowUpIcon' },
      { name: 'Today\'s Lube Sale', value: 10000, icon: 'ArrowUpIcon' },
    ],
    profitability: {
      grossMargin: 20.00, // (985369 / 4926846) * 100
      netMargin: -93.13, // (-4588623 / 4926846) * 100
    },
    currentRatio: {
      ratio: 0.70, // 3798535 / 5425360
    },
    topExpenses: [
      { name: 'Interest Provision', amount: 2658180 },
      { name: 'Depreciation', amount: 1291645 },
      { name: 'Interest Charged by Bank', amount: 909319 },
      { name: 'Staff Salary & Allowances', amount: 325000 },
      { name: 'Office Rent', amount: 144000 },
    ],
    revenueSources: {
      labels: ['Petrol', 'Diesel', 'Lubricants', 'Other'],
      data: [2150000, 1550000, 1000000, 226846],
    },
  },
  ars_corp: {
    stats: [
      { name: 'Yesterday Closing', value: 450000, icon: 'BanknotesIcon' },
      { name: 'Today\'s Sales', value: 120500, icon: 'ArrowUpIcon' },
      { name: 'Total Receivables', value: 2100500, icon: 'ArrowDownIcon' },
      { name: 'Total Payables', value: 1850230, icon: 'ArrowUpIcon' },
    ],
    profitability: {
      grossMargin: 35.5,
      netMargin: 12.8,
    },
    currentRatio: {
      ratio: 2.1,
    },
    topExpenses: [
      { name: 'Dealer Commission', amount: 1200000 },
      { name: 'Vehicle Running Costs', amount: 850000 },
      { name: 'Salaries & Wages', amount: 450000 },
      { name: 'Cylinder Re-testing', amount: 250000 },
      { name: 'Marketing', amount: 150000 },
    ],
    revenueSources: {
      labels: ['Beximco 12KG', 'SENA 12KG', 'Beximco 22KG', 'SENA 35KG'],
      data: [4500000, 3500000, 2000000, 1500000],
    },
  }
};

export const sundryDebtors = {
  ars_lube: [
    { id: 'd001', name: 'Rahim Filling Station', amount: 450000, due: '2025-10-15', aging: 14 },
    { id: 'd002', name: 'Karim Traders', amount: 300000, due: '2025-09-25', aging: 36 },
    { id: 'd003', name: 'Salam Enterprise', amount: 500000, due: '2025-10-05', aging: 26 },
  ],
  ars_corp: [
    { id: 'd004', name: 'Beximco LPG Dealer', amount: 800000, due: '2025-10-20', aging: 9 },
    { id: 'd005', name: 'SENA Gas Supplies', amount: 1300500, due: '2025-09-10', aging: 51 },
  ],
};

export const sundryCreditors = {
  ars_lube: [
    { id: 'c001', name: 'Govt. Fuel Depot', amount: 1500000, due: '2025-10-30', aging: 1 },
    { id: 'c002', name: 'Lubricant Imports Inc.', amount: 1163885, due: '2025-10-10', aging: 21 },
  ],
  ars_corp: [
    { id: 'c003', name: 'Beximco Head Office', amount: 950000, due: '2025-11-05', aging: -4 },
    { id: 'c004', name: 'SENA Head Office', amount: 900230, due: '2025-10-25', aging: 6 },
  ],
};

export const inventoryData = {
  ars_lube: [
    { id: 'L001', name: 'Petrol (Octane 95)', sku: 'ARS-FUL-001', category: 'Fuel', stock: 15000, unit: 'Litre', costPrice: 125, salePrice: 130, status: 'In Stock' },
    { id: 'L002', name: 'Diesel', sku: 'ARS-FUL-002', category: 'Fuel', stock: 25000, unit: 'Litre', costPrice: 108, salePrice: 110, status: 'In Stock' },
    { id: 'L003', name: 'Mobil 1™ 5W-30', sku: 'ARS-LUB-001', category: 'Lubricant', stock: 45, unit: 'Can', costPrice: 4500, salePrice: 4800, status: 'Low Stock' },
    { id: 'L004', name: 'Shell Helix HX5', sku: 'ARS-LUB-002', category: 'Lubricant', stock: 150, unit: 'Can', costPrice: 2800, salePrice: 3100, status: 'In Stock' },
    { id: 'L005', name: 'Engine Coolant', sku: 'ARS-MSC-001', category: 'Misc', stock: 0, unit: 'Bottle', costPrice: 500, salePrice: 650, status: 'Out of Stock' },
  ],
  ars_corp: [
    { id: 'C001', name: 'Beximco LPG 12KG', sku: 'ARS-LPG-B12', category: 'LPG', stock: 85, unit: 'Cylinder', costPrice: 1200, salePrice: 1400, status: 'In Stock' },
    { id: 'C002', name: 'Beximco LPG 22KG', sku: 'ARS-LPG-B22', category: 'LPG', stock: 30, unit: 'Cylinder', costPrice: 2200, salePrice: 2500, status: 'Low Stock' },
    { id: 'C003', name: 'SENA LPG 12KG', sku: 'ARS-LPG-S12', category: 'LPG', stock: 120, unit: 'Cylinder', costPrice: 1150, salePrice: 1350, status: 'In Stock' },
    { id: 'C004', name: 'SENA LPG 35KG', sku: 'ARS-LPG-S35', category: 'LPG', stock: 15, unit: 'Cylinder', costPrice: 3400, salePrice: 3800, status: 'Low Stock' },
  ],
};

export const balanceSheetData = {
  ars_lube: {
    date: "30 June 2024",
    assets: {
      nonCurrent: [
        { name: "Property, Plant & Equipment", amount: 10793421 },
      ],
      current: [
        { name: "Inventories", amount: 743458 },
        { name: "Advance, Deposit & Pre-payments", amount: 263230 },
        { name: "Advance Income Tax", amount: 2383099 },
        { name: "Investment in FDR", amount: 394481 },
        { name: "Cash & Cash Equivalents", amount: 14267 },
      ],
    },
    liabilities: {
      nonCurrent: [
        { name: "Bank Loan", amount: 35091487 },
      ],
      current: [
        { name: "Account Payable", amount: 2663885 },
        { name: "Liabilities for Expense", amount: 143000 },
        { name: "Provision for Income Tax", amount: 2618475 },
      ],
    },
    equity: [
      { name: "Paid up Capital", amount: 1800000 },
      { name: "Retained Earnings", amount: -27724891 },
    ]
  },
  ars_corp: {
    date: "30 June 2024",
    assets: {
      nonCurrent: [
        { name: "Delivery Vehicles", amount: 5500000 },
        { name: "Office Equipment", amount: 800000 },
      ],
      current: [
        { name: "Inventories (LPG)", amount: 1200000 },
        { name: "Accounts Receivable", amount: 2100500 },
        { name: "Cash & Bank Balance", amount: 450000 },
      ],
    },
    liabilities: {
      nonCurrent: [
        { name: "Long-term Loan", amount: 4000000 },
      ],
      current: [
        { name: "Accounts Payable", amount: 1850230 },
        { name: "Accrued Expenses", amount: 250000 },
      ],
    },
    equity: [
      { name: "Owner's Capital", amount: 3000000 },
      { name: "Retained Earnings", amount: 950270 },
    ]
  }
};