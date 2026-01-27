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
  ars_lube: ['Rahim Transport', 'Karim Motors', 'Dhaka Bus Svc', 'Chittagong Lines', 'Padma Logistics'],
  ars_corp: ['Beximco Dealer A', 'SENA Distributor', 'Jamuna Gas Point', 'Bashundhara Agent']
};

const SUPPLIERS = {
  ars_lube: ['Govt. Fuel Depot', 'Meghna Petroleum', 'Jamuna Oil Co'],
  ars_corp: ['Beximco LPG Plant', 'SENA Kalyan Sangstha', 'Omera LPG HQ']
};

const INVENTORY = {
  ars_lube: [
    { name: 'Petrol (Octane)', sku: 'FUL-OCT', category: 'Fuel', unit: 'Litre', cost: 125, sale: 135 },
    { name: 'Diesel', sku: 'FUL-DSL', category: 'Fuel', unit: 'Litre', cost: 108, sale: 115 },
    { name: 'Mobil 1 5W-30', sku: 'LUB-M5W', category: 'Lubricant', unit: 'Can', cost: 4200, sale: 4800 },
  ],
  ars_corp: [
    { name: 'LPG 12KG Cylinder', sku: 'LPG-12KG', category: 'LPG', unit: 'Cylinder', cost: 1150, sale: 1450 },
    { name: 'LPG 35KG Commercial', sku: 'LPG-35KG', category: 'LPG', unit: 'Cylinder', cost: 3200, sale: 3800 },
  ]
};

const ACCOUNTS = {
  ars_lube: [
    { code: 1001, name: 'Cash in Hand', type: 'Asset', balance: 500000 },
    { code: 4002, name: 'Office Rent', type: 'Expense', balance: 120000 },
    { code: 4003, name: 'Staff Salaries', type: 'Expense', balance: 350000 },
  ],
  ars_corp: [
    { code: 1001, name: 'Cash @ Bank', type: 'Asset', balance: 1200000 },
    { code: 4001, name: 'Logistics Expense', type: 'Expense', balance: 450000 },
  ]
};

async function main() {
  console.log('🗑️  Cleaning database...');
  try {
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
  } catch(e) {
    console.log("Cleanup failed (tables might not exist), continuing...");
  }

  console.log('🏢 Seeding Companies & Users...');
  
  // 1. Create Companies
  for (const company of COMPANIES) {
    await prisma.companies.create({
      data: {
        id: company.id,
        name: company.name,
        shortName: company.shortName,
        dashboard_stats: {}, // Important: Created empty, populated by API
      },
    });
  }

  // 2. Create Users (Exact credentials requested)
  const passwordHash = await bcrypt.hash('123456', 10);

  // Admin
  await prisma.users.create({
    data: { email: 'admin@arsgroup.com', password: passwordHash, name: 'Super Admin', role: 'admin' },
  });

  // Managers
  await prisma.users.create({
    data: { email: 'manager.lube@arsgroup.com', password: passwordHash, name: 'Lube Manager', role: 'user', company_id: 'ars_lube' },
  });
  await prisma.users.create({
    data: { email: 'manager.corp@arsgroup.com', password: passwordHash, name: 'Corp Manager', role: 'user', company_id: 'ars_corp' },
  });

  // Users
  await prisma.users.create({
    data: { email: 'user.lube@arsgroup.com', password: passwordHash, name: 'Lube User', role: 'user', company_id: 'ars_lube' },
  });
  await prisma.users.create({
    data: { email: 'user.corp@arsgroup.com', password: passwordHash, name: 'Corp User', role: 'user', company_id: 'ars_corp' },
  });


  const startDate = new Date('2024-07-01');
  const endDate = new Date('2025-06-30');

  for (const company of COMPANIES) {
    console.log(`\n🚀 Processing ${company.name}...`);
    
    // 3. Inventory
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

    // 4. Transactions (Sales & Purchases)
    // Generate ~150 sales spread over the year
    for (let i = 0; i < 150; i++) {
      const date = randomDate(startDate, endDate);
      const item = getRandomItem(invItems);
      const qty = getRandomInt(1, 20);
      const amount = parseFloat((qty * Number(item.salePrice)).toFixed(2));
      
      const uniqueId = `INV-${company.id.substring(4,7).toUpperCase()}-${1000 + i}`;

      await prisma.sales.create({
        data: {
          id: uniqueId,
          company_id: company.id,
          customer: getRandomItem(CUSTOMERS[company.id]),
          date: date,
          amount: amount,
          status: Math.random() > 0.3 ? 'Paid' : 'Unpaid'
        }
      });
    }

    // Generate ~50 purchases
    for (let i = 0; i < 50; i++) {
      const date = randomDate(startDate, endDate);
      const item = getRandomItem(invItems);
      const qty = getRandomInt(50, 200);
      const amount = parseFloat((qty * Number(item.costPrice)).toFixed(2));
      
      const uniqueId = `PO-${company.id.substring(4,7).toUpperCase()}-${2000 + i}`;

      await prisma.purchases.create({
        data: {
          id: uniqueId,
          company_id: company.id,
          supplier: getRandomItem(SUPPLIERS[company.id]),
          date: date,
          amount: amount,
          status: Math.random() > 0.2 ? 'Paid' : 'Unpaid'
        }
      });
    }

    // 5. Debtors & Creditors
    for (let i = 0; i < 5; i++) {
      await prisma.debtors.create({
        data: {
          company_id: company.id,
          name: getRandomItem(CUSTOMERS[company.id]),
          amount: getRandomFloat(10000, 150000),
          due: randomDate(new Date('2025-05-01'), new Date('2025-08-01')),
          aging: getRandomInt(10, 90)
        }
      });
    }

    for (let i = 0; i < 4; i++) {
      await prisma.creditors.create({
        data: {
          company_id: company.id,
          name: getRandomItem(SUPPLIERS[company.id]),
          amount: getRandomFloat(50000, 500000),
          due: randomDate(new Date('2025-06-01'), new Date('2025-09-01')),
          aging: getRandomInt(0, 45)
        }
      });
    }

    // 6. Fixed Assets
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

    // 7. Chart of Accounts (Balances)
    for (const acc of ACCOUNTS[company.id]) {
      await prisma.chart_of_accounts.create({
        data: {
          company_id: company.id,
          code: acc.code,
          name: acc.name,
          type: acc.type,
          balance: parseFloat(acc.balance)
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