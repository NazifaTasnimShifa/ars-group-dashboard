// src/data/mockData.js

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

export const dashboardData = {
  ars_lube: {
    stats: [
      { name: 'Opening Balance (2023)', value: 20701199, icon: 'BanknotesIcon' },
      { name: 'Current Balance (2024)', value: 14591956, icon: 'BanknotesIcon' },
      { name: 'Today\'s Fuel Sale', value: 65200, icon: 'ArrowUpIcon' },
      { name: 'Today\'s Lube Sale', value: 10000, icon: 'ArrowUpIcon' },
    ],
    profitability: {
      grossMargin: 20.00,
      netMargin: -93.13,
    },
    currentRatio: {
      ratio: 0.70,
    },
    topExpenses: [
      { name: 'Interest Provision', amount: 2658180 },
      { name: 'Depreciation', amount: 1291645 },
      { name: 'Interest Charged by Bank', amount: 909319 },
      { name: 'Staff Salary', amount: 325000 },
      { name: 'Office Rent', amount: 144000 },
    ],
    revenueSources: {
      labels: ['Petrol', 'Diesel', 'Lubricants', 'Other'],
      data: [2150000, 1550000, 1000000, 226846],
    },
    revenueChart: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [] 
    },
    debtors: [],
    creditors: []
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
    revenueChart: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [] 
    },
    debtors: [],
    creditors: []
  }
};

// Placeholder arrays to prevent crashes if pages are accessed
export const sundryDebtors = { ars_lube: [], ars_corp: [] };
export const sundryCreditors = { ars_lube: [], ars_corp: [] };
export const inventoryData = { ars_lube: [], ars_corp: [] };
export const salesData = { ars_lube: [], ars_corp: [] };
export const purchasesData = { ars_lube: [], ars_corp: [] };
export const fixedAssetsData = { ars_lube: [], ars_corp: [] };
export const processLossData = { ars_lube: [], ars_corp: [] };
export const chartOfAccountsData = { ars_lube: [], ars_corp: [] };
export const incomeStatementData = { ars_lube: null, ars_corp: null };
export const balanceSheetData = { ars_lube: null, ars_corp: null };
export const cashFlowStatementData = { ars_lube: null, ars_corp: null };
export const trialBalanceData = { ars_lube: null, ars_corp: null };