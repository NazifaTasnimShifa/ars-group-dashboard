// prisma/seed.mjs

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { 
  companies, 
  sundryDebtors, 
  sundryCreditors, 
  inventoryData, 
  salesData, 
  purchasesData, 
  fixedAssetsData, 
  processLossData, 
  chartOfAccountsData,
  dashboardData
} from '../src/data/mockData.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // 1. Clear existing data to avoid unique key conflicts during re-seeding
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

  // 2. Seed Companies & Dashboard Stats
  for (const company of companies) {
    const stats = dashboardData[company.id] || {};

    await prisma.companies.create({
      data: {
        id: company.id,
        name: company.name,
        shortName: company.shortName,
        dashboard_stats: stats, 
      },
    });
    console.log(`Created company: ${company.name}`);
  }

  // 3. Seed Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.users.create({
    data: {
      email: 'admin@arsgroup.com',
      password: adminPassword,
      name: 'ARS Group Admin',
      role: 'admin',
    },
  });

  const userPassword = await bcrypt.hash('user123', 10);
  await prisma.users.create({
    data: {
      email: 'lube@arsgroup.com',
      password: userPassword,
      name: 'Lube Manager',
      role: 'user',
      company_id: 'ars_lube',
    },
  });

  await prisma.users.create({
    data: {
      email: 'corp@arsgroup.com',
      password: userPassword,
      name: 'Corp Manager',
      role: 'user',
      company_id: 'ars_corp',
    },
  });
  console.log('Created users');

  // 4. Seed Related Data
  const companyIds = ['ars_lube', 'ars_corp'];

  for (const cid of companyIds) {
    
    // Debtors
    const debtors = sundryDebtors[cid] || [];
    if (debtors.length > 0) {
        await prisma.debtors.createMany({
            data: debtors.map(d => ({
                company_id: cid,
                name: d.name,
                amount: d.amount,
                due: new Date(d.due),
                aging: d.aging
            }))
        });
    }

    // Creditors
    const creditors = sundryCreditors[cid] || [];
    if (creditors.length > 0) {
        await prisma.creditors.createMany({
            data: creditors.map(c => ({
                company_id: cid,
                name: c.name,
                amount: c.amount,
                due: new Date(c.due),
                aging: c.aging
            }))
        });
    }

    // Inventory
    const inventory = inventoryData[cid] || [];
    for (const item of inventory) {
        await prisma.inventory_items.create({
            data: {
                id: item.id,
                company_id: cid,
                name: item.name,
                sku: item.sku,
                category: item.category,
                stock: item.stock,
                unit: item.unit,
                costPrice: item.costPrice,
                salePrice: item.salePrice,
                status: item.status
            }
        });
    }

    // Sales
    const sales = salesData[cid] || [];
    for (const sale of sales) {
        await prisma.sales.create({
            data: {
                id: sale.id,
                company_id: cid,
                customer: sale.customer,
                date: new Date(sale.date),
                amount: sale.amount,
                status: sale.status
            }
        });
    }

    // Purchases
    const purchases = purchasesData[cid] || [];
    for (const po of purchases) {
        await prisma.purchases.create({
            data: {
                id: po.id,
                company_id: cid,
                supplier: po.supplier,
                date: new Date(po.date),
                amount: po.amount,
                status: po.status
            }
        });
    }

    // Fixed Assets
    const assets = fixedAssetsData[cid] || [];
    for (const fa of assets) {
        await prisma.fixed_assets.create({
            data: {
                id: fa.id,
                company_id: cid,
                name: fa.name,
                acquisitionDate: new Date(fa.acquisitionDate),
                cost: fa.cost,
                depreciation: fa.depreciation,
                bookValue: fa.bookValue
            }
        });
    }

    // Process Loss
    const losses = processLossData[cid] || [];
    for (const pl of losses) {
        await prisma.process_loss.create({
            data: {
                id: pl.id,
                company_id: cid,
                date: new Date(pl.date),
                product: pl.product,
                type: pl.type,
                quantity: pl.quantity,
                unit: pl.unit,
                notes: pl.notes
            }
        });
    }

    // Chart of Accounts
    const accounts = chartOfAccountsData[cid] || [];
    if (accounts.length > 0) {
        await prisma.chart_of_accounts.createMany({
            data: accounts.map(acc => ({
                company_id: cid,
                code: acc.code,
                name: acc.name,
                type: acc.type,
                balance: acc.balance
            }))
        });
    }
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });