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
    stats: {
      todaySales: 75200,
      yesterdayClosing: 14267, // From tax file 'Cash & cash equivalents'
      totalReceivables: 1250000,
      totalPayables: 2663885, // From tax file 'Account payable'
    },
  },
  {
    id: 'ars_corp',
    name: 'ARS Corporation',
    shortName: 'ARS Corp',
    stats: {
      todaySales: 120500,
      yesterdayClosing: 450000,
      totalReceivables: 2100500,
      totalPayables: 1850230,
    },
  },
];

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