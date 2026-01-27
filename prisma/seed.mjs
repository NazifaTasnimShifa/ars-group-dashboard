// prisma/schema.prisma must exist and be valid before running this.
// Run: npx prisma db push --force
// Then: node prisma/seed.mjs

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // 1. Clean up existing data to prevent duplicates
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

  // 2. Create Companies
  const arsLube = await prisma.companies.create({
    data: {
      id: 'ars_lube',
      name: 'ARS Lube LTD BD',
      shortName: 'ARS Lube',
      // We leave JSON blobs null or empty as we now use dynamic APIs
      dashboard_stats: {}, 
    },
  });

  const arsCorp = await prisma.companies.create({
    data: {
      id: 'ars_corp',
      name: 'ARS Corporation',
      shortName: 'ARS Corp',
      dashboard_stats: {},
    },
  });

  console.log('Created companies.');

  // 3. Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  await prisma.users.create({
    data: {
      email: 'admin@arsgroup.com',
      password: adminPassword,
      name: 'Super Admin',
      role: 'admin',
    },
  });

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

  console.log('Created users.');

  // 4. Seed Dummy Data for ARS Lube
  // Inventory
  await prisma.inventory_items.createMany({
    data: [
      { id: 'L001', company_id: 'ars_lube', name: 'Petrol', sku: 'FUL-001', category: 'Fuel', stock: 5000, unit: 'Litre', costPrice: 125, salePrice: 130, status: 'In Stock' },
      { id: 'L002', company_id: 'ars_lube', name: 'Diesel', sku: 'FUL-002', category: 'Fuel', stock: 8000, unit: 'Litre', costPrice: 108, salePrice: 110, status: 'In Stock' },
    ]
  });

  // Sales
  await prisma.sales.createMany({
    data: [
      { id: 'INV-1001', company_id: 'ars_lube', customer: 'Rahim Transport', date: new Date('2024-06-01'), amount: 50000, status: 'Paid' },
      { id: 'INV-1002', company_id: 'ars_lube', customer: 'Karim Motors', date: new Date('2024-06-05'), amount: 12000, status: 'Unpaid' },
    ]
  });

  // Purchases
  await prisma.purchases.createMany({
    data: [
      { id: 'PO-2001', company_id: 'ars_lube', supplier: 'Padma Oil', date: new Date('2024-05-20'), amount: 450000, status: 'Paid' },
    ]
  });

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