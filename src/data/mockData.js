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