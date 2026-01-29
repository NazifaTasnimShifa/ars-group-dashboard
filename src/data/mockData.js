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

export const incomeStatementData = {
  ars_lube: {
    date: "For the year ended 30 June 2024",
    revenue: { name: "Revenue", amount: 4926846 },
    costOfGoodsSold: { name: "Cost of Goods Sold", amount: 3941477 },
    expenses: {
      administrative: { name: "Administrative & General Expenses", amount: 1893527 },
      selling: { name: "Selling & Marketing Expenses", amount: 95000 },
      financial: { name: "Financial Expenses", amount: 3567499 },
    },
    otherIncome: { name: "Other Income - Bank Interest", amount: 11595 },
  },
  ars_corp: {
    date: "For the year ended 30 June 2024",
    revenue: { name: "Commission Revenue", amount: 11500000 },
    costOfGoodsSold: { name: "Cost of Sales (Commission)", amount: 1200000 },
    expenses: {
      administrative: { name: "Administrative Expenses", amount: 1800000 },
      selling: { name: "Vehicle & Marketing Costs", amount: 950000 },
      financial: { name: "Bank Charges", amount: 50000 },
    },
    otherIncome: { name: "Other Income", amount: 75000 },
  }
};

export const cashFlowStatementData = {
  ars_lube: {
    date: "For the year ended 30 June 2024",
    operating: [
      { name: "Net Profit/(Loss)", amount: -4588623 },
      { name: "Adjustments for Depreciation", amount: 1291645 },
      { name: "Changes in Advances, Deposits & Pre-payments", amount: 412040 },
      { name: "Changes in Accounts Receivable", amount: 1264479 },
      { name: "Changes in Inventories", amount: 2581752 },
      { name: "Changes in Accounts Payable", amount: -1380000 },
    ],
    investing: [
      { name: "Acquisition of Fixed Assets", amount: 0 },
      { name: "Increase/Decrease in FDR", amount: -7966 },
    ],
    financing: [
      { name: "Increase/Decrease in Bank Loan", amount: -230681 },
    ],
    openingCash: 585039,
  },
  ars_corp: {
    date: "For the year ended 30 June 2024",
    operating: [
      { name: "Net Profit", amount: 1200000 },
      { name: "Adjustments for Depreciation", amount: 450000 },
      { name: "Changes in Accounts Receivable", amount: -250000 },
      { name: "Changes in Inventories", amount: -150000 },
      { name: "Changes in Accounts Payable", amount: 300000 },
    ],
    investing: [
      { name: "Purchase of Delivery Vehicle", amount: -800000 },
    ],
    financing: [
      { name: "Owner's Capital Introduced", amount: 500000 },
      { name: "Owner's Drawings", amount: -200000 },
    ],
    openingCash: 350000,
  }
};

export const purchasesData = {
  ars_lube: [
    { id: 'PO-24-001', supplier: 'Govt. Fuel Depot', date: '2024-06-15', amount: 1356205, status: 'Paid' },
    { id: 'PO-24-002', supplier: 'Lubricant Imports Inc.', date: '2024-06-20', amount: 850000, status: 'Paid' },
    { id: 'PO-24-003', supplier: 'Padma Oil Company', date: '2024-07-10', amount: 1500000, status: 'Unpaid' },
  ],
  ars_corp: [
    { id: 'PO-24-101', supplier: 'Beximco LPG Unit', date: '2024-06-18', amount: 950000, status: 'Paid' },
    { id: 'PO-24-102', supplier: 'SENA Kalyan Sangstha', date: '2024-06-25', amount: 900230, status: 'Paid' },
    { id: 'PO-24-103', supplier: 'Beximco LPG Unit', date: '2024-07-12', amount: 1100000, status: 'Partial' },
  ],
};

export const processLossData = {
  ars_lube: [
    { id: 'PL-001', date: '2024-06-30', product: 'Petrol (Octane 95)', type: 'Vaporization', quantity: 75.5, unit: 'Litre', notes: 'Monthly estimated vaporization loss.' },
    { id: 'PL-002', date: '2024-07-15', product: 'Diesel', type: 'Spillage', quantity: 25, unit: 'Litre', notes: 'Spillage during tanker unloading.' },
  ],
  ars_corp: [],
};


export const salesData = {
  ars_lube: [
    { id: 'INV-24-001', customer: 'Rahim Filling Station', date: '2024-06-12', amount: 450000, status: 'Paid' },
    { id: 'INV-24-002', customer: 'Karim Traders', date: '2024-06-18', amount: 300000, status: 'Paid' },
    { id: 'INV-24-003', customer: 'Local Retail Sale', date: '2024-07-05', amount: 75200, status: 'Paid' },
    { id: 'INV-24-004', customer: 'Salam Enterprise', date: '2024-07-11', amount: 500000, status: 'Unpaid' },
  ],
  ars_corp: [
    { id: 'INV-24-201', customer: 'Beximco LPG Dealer', date: '2024-06-20', amount: 800000, status: 'Paid' },
    { id: 'INV-24-202', customer: 'SENA Gas Supplies', date: '2024-07-01', amount: 1300500, status: 'Unpaid' },
    { id: 'INV-24-203', customer: 'Local Distributor', date: '2024-07-14', amount: 120500, status: 'Paid' },
  ],
};

export const fixedAssetsData = {
  ars_lube: [
    { id: 'FA-001', name: 'Land', acquisitionDate: '2012-01-01', cost: 2666990, depreciation: 0, bookValue: 2666990 },
    { id: 'FA-002', name: 'Building', acquisitionDate: '2013-01-01', cost: 2395217, depreciation: 119761, bookValue: 2275456 },
    { id: 'FA-003', name: 'Motor Vehicles', acquisitionDate: '2020-05-10', cost: 4144629, depreciation: 828926, bookValue: 3315703 },
  ],
  ars_corp: [
    { id: 'FA-101', name: 'Delivery Truck', acquisitionDate: '2021-02-15', cost: 3500000, depreciation: 700000, bookValue: 2800000 },
    { id: 'FA-102', name: 'Office Equipment', acquisitionDate: '2022-08-01', cost: 800000, depreciation: 80000, bookValue: 720000 },
  ],
};

export const trialBalanceData = {
  ars_lube: {
    date: "As at 30 June 2024",
    accounts: [
      { name: 'Property, Plant & Equipment', debit: 10793421, credit: 0 },
      { name: 'Current Assets', debit: 3798535, credit: 0 },
      { name: 'Expenses (Total)', debit: 5555026, credit: 0 },
      { name: 'Paid up Capital', debit: 0, credit: 1800000 },
      { name: 'Retained Earnings (Opening Loss)', debit: 0, credit: 23136268 },
      { name: 'Bank Loan', debit: 0, credit: 35091487 },
      { name: 'Current Liabilities', debit: 0, credit: 5425360 },
      { name: 'Revenue', debit: 0, credit: 4926846 },
    ]
  },
  ars_corp: {
    date: "As at 30 June 2024",
    accounts: [
      { name: 'Fixed Assets', debit: 6300000, credit: 0 },
      { name: 'Current Assets', debit: 3750500, credit: 0 },
      { name: 'Expenses (Total)', debit: 3000000, credit: 0 },
      { name: 'Owner\'s Capital', debit: 0, credit: 3000000 },
      { name: 'Retained Earnings', debit: 0, credit: 950270 },
      { name: 'Long-term Loan', debit: 0, credit: 4000000 },
      { name: 'Current Liabilities', debit: 0, credit: 2100230 },
      { name: 'Revenue', debit: 0, credit: 11500000 },
    ]
  }
};

export const chartOfAccountsData = {
  ars_lube: [
    { code: 1110, name: 'Cash & Bank', type: 'Asset', balance: 14267 },
    { code: 1120, name: 'Accounts Receivable', type: 'Asset', balance: 0 },
    { code: 1130, name: 'Inventory', type: 'Asset', balance: 743458 },
    { code: 1220, name: 'Vehicles', type: 'Asset', balance: 3315703 },
    { code: 2110, name: 'Accounts Payable', type: 'Liability', balance: 2663885 },
    { code: 2210, name: 'Bank Loans', type: 'Liability', balance: 35091487 },
    { code: 3100, name: 'Paid up Capital', type: 'Equity', balance: 1800000 },
    { code: 4100, name: 'Sales Revenue', type: 'Income', balance: 4926846 },
    { code: 5210, name: 'Driver Salary', type: 'Expense', balance: 95000 },
    { code: 5220, name: 'Fuel Costs', type: 'Expense', balance: 150000 },
    { code: 5310, name: 'Office Rent', type: 'Expense', balance: 144000 },
  ],
  ars_corp: [
    { code: 1100, name: 'Bank Balance', type: 'Asset', balance: 450000 },
    { code: 1110, name: 'Receivables', type: 'Asset', balance: 2100500 },
    { code: 2100, name: 'Payables', type: 'Liability', balance: 1850230 },
    { code: 3000, name: 'Owner\'s Equity', type: 'Equity', balance: 950270 },
    { code: 4100, name: 'Commission Income', type: 'Income', balance: 11500000 },
    { code: 5100, name: 'Dealer Commission', type: 'Expense', balance: 1200000 },
    { code: 5200, name: 'Operating Costs', type: 'Expense', balance: 950000 },
  ]
};