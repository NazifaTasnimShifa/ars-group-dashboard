// prisma/seed.mjs

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// --- Helpers ---
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// --- Data Definitions ---

const COMPANIES = [
  { id: 'ars_lube', name: 'ARS Lube LTD BD', shortName: 'ARS Lube' },
  { id: 'ars_corp', name: 'ARS Corporation', shortName: 'ARS Corp' }
];

const CUSTOMERS = {
  ars_lube: ['Rahim Transport', 'Karim Motors', 'Dhaka Bus Svc', 'Chittagong Lines', 'Padma Logistics', 'Express Courier', 'Yellow Cab Co'],
  ars_corp: ['Beximco Dealer A', 'SENA Distributor', 'Jamuna Gas Point', 'Bashundhara Agent', 'Local Retailer #105', 'City Gas Station']
};

const SUPPLIERS = {
  ars_lube: ['Govt. Fuel Depot', 'Meghna Petroleum', 'Jamuna Oil Co', 'Standard Asiatic Oil', 'Lubricant Imports Inc.'],
  ars_corp: ['Beximco LPG Plant', 'SENA Kalyan Sangstha', 'Omera LPG HQ', 'Bashundhara Gas Factory']
};

const INVENTORY = {
  ars_lube: [
    { name: 'Petrol (Octane)', sku: 'FUL-OCT', category: 'Fuel', unit: 'Litre', cost: 125, sale: 135 },
    { name: 'Diesel', sku: 'FUL-DSL', category: 'Fuel', unit: 'Litre', cost: 108, sale: 115 },
    { name: 'Mobil 1 5W-30', sku: 'LUB-M5W', category: 'Lubricant', unit: 'Can', cost: 4200, sale: 4800 },
    { name: 'Shell Helix HX7', sku: 'LUB-SH7', category: 'Lubricant', unit: 'Can', cost: 3500, sale: 3900 },
    { name: 'Brake Fluid DOT4', sku: 'MSC-BF4', category: 'Misc', unit: 'Bottle', cost: 450, sale: 600 }
  ],
  ars_corp: [
    { name: 'LPG 12KG Cylinder', sku: 'LPG-12KG', category: 'LPG', unit: 'Cylinder', cost: 1150, sale: 1450 },
    { name: 'LPG 35KG Commercial', sku: 'LPG-35KG', category: 'LPG', unit: 'Cylinder', cost: 3200, sale: 3800 },
    { name: 'LPG 45KG Industrial', sku: 'LPG-45KG', category: 'LPG', unit: 'Cylinder', cost: 4100, sale: 4900 },
    { name: 'Safety Valve', sku: 'ACC-VAL', category: 'Accessories', unit: 'Pcs', cost: 250, sale: 450 }
  ]
};

const ACCOUNTS = {
  ars_lube: [
    { code: 1001, name: 'Cash in Hand', type: 'Asset', balance: 0 }, // Will calculate
    { code: 1002, name: 'Bank Asia - 1022', type: 'Asset', balance: 0 },
    { code: 3001, name: 'Sales Revenue', type: 'Income', balance: 0 },
    { code: 4001, name: 'Cost of Goods Sold', type: 'Expense', balance: 0 },
    { code: 4002, name: 'Office Rent', type: 'Expense', balance: 0 },
    { code: 4003, name: 'Staff Salaries', type: 'Expense', balance: 0 },
  ],
  ars_corp: [
    { code: 1001, name: 'Cash @ Bank', type: 'Asset', balance: 0 },
    { code: 3001, name: 'Commission Income', type: 'Income', balance: 0 },
    { code: 4001, name: 'Logistics Expense', type: 'Expense', balance: 0 },
  ]
};

async function main() {
  console.log('🗑️  Cleaning database...');
  await prisma.process_loss.deleteMany();
  await prisma.chart_of_accounts.deleteMany();
  await prisma.fixed_assets.deleteMany();
  await prisma.purchases.deleteMany();
  await prisma.sales.deleteMany();
  await prisma.inventory_items.deleteMany();
  await prisma.creditors.deleteMany();
  await prisma.debtors.deleteMany();
  await prisma.users.deleteMany();
  await prisma.companies.deleteMany();

  console.log('🏢 Seeding Companies & Users...');
  
  // 1. Users & Companies
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.users.create({
    data: { email: 'admin@arsgroup.com', password: hashedPassword, name: 'Super Admin', role: 'admin' },
  });

  const startDate = new Date('2024-07-01');
  const endDate = new Date('2025-06-30');

  for (const company of COMPANIES) {
    console.log(`\n🚀 Processing ${company.name}...`);
    
    await prisma.companies.create({
      data: {
        id: company.id,
        name: company.name,
        shortName: company.shortName,
        dashboard_stats: {}, // Will be dynamic now
      },
    });

    await prisma.users.create({
      data: {
        email: `${company.shortName.toLowerCase().replace(' ', '')}@arsgroup.com`,
        password: hashedPassword,
        name: `${company.shortName} Manager`,
        role: 'user',
        company_id: company.id,
      },
    });

    // 2. Inventory
    const invItems = [];
    for (const item of INVENTORY[company.id]) {
      const created = await prisma.inventory_items.create({
        data: {
          id: `${company.id.split('_')[1].toUpperCase()}-${item.sku}`,
          company_id: company.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          unit: item.unit,
          costPrice: item.cost,
          salePrice: item.sale,
          stock: getRandomInt(50, 500),
          status: 'In Stock'
        }
      });
      invItems.push(created);
    }

    // 3. Transactions (Sales & Purchases)
    let totalSales = 0;
    let totalPurchases = 0;
    
    // Generate ~150 sales spread over the year
    for (let i = 0; i < 150; i++) {
      const date = randomDate(startDate, endDate);
      const item = getRandomItem(invItems);
      const qty = getRandomInt(1, 20);
      const amount = parseFloat((qty * Number(item.salePrice)).toFixed(2));
      const status = Math.random() > 0.3 ? 'Paid' : 'Unpaid';
      
      await prisma.sales.create({
        data: {
          id: `INV-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}-${getRandomInt(1000, 9999)}`,
          company_id: company.id,
          customer: getRandomItem(CUSTOMERS[company.id]),
          date: date,
          amount: amount,
          status: status
        }
      });
      totalSales += amount;
    }

    // Generate ~50 purchases
    for (let i = 0; i < 50; i++) {
      const date = randomDate(startDate, endDate);
      const item = getRandomItem(invItems);
      const qty = getRandomInt(50, 200); // Bulk buying
      const amount = parseFloat((qty * Number(item.costPrice)).toFixed(2));
      
      await prisma.purchases.create({
        data: {
          id: `PO-${date.getFullYear()}-${getRandomInt(100, 999)}`,
          company_id: company.id,
          supplier: getRandomItem(SUPPLIERS[company.id]),
          date: date,
          amount: amount,
          status: Math.random() > 0.2 ? 'Paid' : 'Unpaid'
        }
      });
      totalPurchases += amount;
    }

    // 4. Debtors & Creditors (Outstanding balances)
    for (const cust of CUSTOMERS[company.id].slice(0, 4)) {
      await prisma.debtors.create({
        data: {
          company_id: company.id,
          name: cust,
          amount: getRandomFloat(10000, 150000),
          due: randomDate(new Date('2025-05-01'), new Date('2025-08-01')),
          aging: getRandomInt(10, 90)
        }
      });
    }

    for (const supp of SUPPLIERS[company.id].slice(0, 3)) {
      await prisma.creditors.create({
        data: {
          company_id: company.id,
          name: supp,
          amount: getRandomFloat(50000, 500000),
          due: randomDate(new Date('2025-06-01'), new Date('2025-09-01')),
          aging: getRandomInt(0, 45)
        }
      });
    }

    // 5. Fixed Assets
    await prisma.fixed_assets.create({
      data: {
        id: `FA-${company.id}-001`,
        company_id: company.id,
        name: 'Delivery Vehicle',
        acquisitionDate: new Date('2022-01-15'),
        cost: 3500000,
        depreciation: 350000,
        bookValue: 2800000
      }
    });

    // 6. Chart of Accounts (Balances)
    // We update the seed balances roughly based on the generated transaction totals
    for (const acc of ACCOUNTS[company.id]) {
      let bal = 0;
      if (acc.type === 'Income') bal = totalSales;
      else if (acc.name.includes('Cost')) bal = totalPurchases;
      else if (acc.type === 'Asset' && acc.name.includes('Cash')) bal = (totalSales - totalPurchases) + 500000; // Starting capital
      else bal = getRandomFloat(50000, 200000); // Random for other expenses

      await prisma.chart_of_accounts.create({
        data: {
          company_id: company.id,
          code: acc.code,
          name: acc.name,
          type: acc.type,
          balance: parseFloat(bal.toFixed(2))
        }
      });
    }
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });