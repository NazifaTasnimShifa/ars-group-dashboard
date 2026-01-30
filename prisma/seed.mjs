// prisma/seed.mjs
// ARS ERP Dashboard - Comprehensive Database Seeding Script
// Seeds ALL mock data into the database using EXISTING models only

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ARS ERP Database Seeding...\n');

  // --- 1. Create Roles ---
  console.log('📋 Creating Roles...');

  const superOwnerRole = await prisma.role.upsert({
    where: { name: 'super_owner' },
    update: {},
    create: {
      name: 'super_owner',
      displayName: 'Super Owner',
      description: 'Full access to all companies and modules',
      permissions: { all: true },
      isSystem: true
    }
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      displayName: 'Manager',
      description: 'Company-level management access',
      permissions: { dashboard: ['company_view'], sales: ['read', 'write'] },
      isSystem: true
    }
  });

  const cashierRole = await prisma.role.upsert({
    where: { name: 'cashier' },
    update: {},
    create: {
      name: 'cashier',
      displayName: 'Pump Cashier',
      description: 'Limited access for pump operations only',
      permissions: { 
        dashboard: ['view'], 
        pump: ['daily_operations', 'credit_sales'],
        sales: ['read', 'write']
      },
      isSystem: true
    }
  });

  console.log('  ✅ Roles created\n');

  // --- 2. Create Businesses ---
  console.log('🏢 Creating Businesses...');

  const arsLube = await prisma.business.upsert({
    where: { code: 'ARS-LUBE' },
    update: {},
    create: {
      code: 'ARS-LUBE',
      name: 'ARS Lube LTD BD',
      shortName: 'ARS Lube',
      type: 'LUBRICANT',
      address: 'Dhaka, Bangladesh',
      isActive: true,
      settings: { currency: 'BDT' }
    }
  });

  const arsCorp = await prisma.business.upsert({
    where: { code: 'ARS-CORP' },
    update: {},
    create: {
      code: 'ARS-CORP',
      name: 'ARS Corporation',
      shortName: 'ARS Corp',
      type: 'PETROL_PUMP',
      address: 'Dhaka, Bangladesh',
      isActive: true,
      settings: { currency: 'BDT' }
    }
  });

  console.log('  ✅ Businesses created: ARS Lube, ARS Corp\n');

  // --- 3. Create Branches ---
  console.log('🏭 Creating Branches...');

  await prisma.branch.upsert({
    where: { businessId_code: { businessId: arsLube.id, code: 'HQ' } },
    update: {},
    create: { businessId: arsLube.id, code: 'HQ', name: 'Lube Distribution Center', address: 'Industrial Area, Dhaka' }
  });

  await prisma.branch.upsert({
    where: { businessId_code: { businessId: arsCorp.id, code: 'MAIN' } },
    update: {},
    create: { businessId: arsCorp.id, code: 'MAIN', name: 'Main Fuel Station', address: 'Main Road, Dhaka' }
  });

  console.log('  ✅ Branches created\n');

  // --- 4. Create Users ---
  console.log('👥 Creating Users...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'owner@arsgroup.com' },
    update: { password: hashedPassword },
    create: { email: 'owner@arsgroup.com', password: hashedPassword, name: 'ARS Group Owner', roleId: superOwnerRole.id, businessId: null }
  });

  await prisma.user.upsert({
    where: { email: 'manager@arslube.com' },
    update: { password: hashedPassword },
    create: { email: 'manager@arslube.com', password: hashedPassword, name: 'ARS Lube Manager', roleId: managerRole.id, businessId: arsLube.id }
  });

  await prisma.user.upsert({
    where: { email: 'manager@arscorp.com' },
    update: { password: hashedPassword },
    create: { email: 'manager@arscorp.com', password: hashedPassword, name: 'ARS Corp Manager', roleId: managerRole.id, businessId: arsCorp.id }
  });

  await prisma.user.upsert({
    where: { email: 'cashier@arscorp.com' },
    update: { password: hashedPassword },
    create: { email: 'cashier@arscorp.com', password: hashedPassword, name: 'Pump Cashier', roleId: cashierRole.id, businessId: arsCorp.id }
  });

  console.log('  ✅ Users created\n');

  // --- 5. Create Inventory Items ---
  console.log('📦 Creating Inventory Items...');

  // ARS Lube Products
  const lubeInventory = [
    { name: 'Petrol (Octane 95)', sku: 'ARS-FUL-001', category: 'Fuel', stock: 15000, unit: 'Litre', costPrice: 125, salePrice: 130, status: 'In Stock' },
    { name: 'Diesel', sku: 'ARS-FUL-002', category: 'Fuel', stock: 25000, unit: 'Litre', costPrice: 108, salePrice: 110, status: 'In Stock' },
    { name: 'Mobil 1™ 5W-30', sku: 'ARS-LUB-001', category: 'Lubricant', stock: 45, unit: 'Can', costPrice: 4500, salePrice: 4800, status: 'Low Stock' },
    { name: 'Shell Helix HX5', sku: 'ARS-LUB-002', category: 'Lubricant', stock: 150, unit: 'Can', costPrice: 2800, salePrice: 3100, status: 'In Stock' },
    { name: 'Engine Coolant', sku: 'ARS-MSC-001', category: 'Misc', stock: 0, unit: 'Bottle', costPrice: 500, salePrice: 650, status: 'Out of Stock' },
  ];

  const lubeProductIds = [];
  for (const item of lubeInventory) {
    const existing = await prisma.inventory_items.findFirst({ where: { company_id: arsLube.id, sku: item.sku } });
    if (!existing) {
      const product = await prisma.inventory_items.create({
        data: { company_id: arsLube.id, ...item }
      });
      lubeProductIds.push(product);
    } else {
      lubeProductIds.push(existing);
    }
  }

  // ARS Corp Products (LPG)
  const corpInventory = [
    { name: 'Beximco LPG 12KG', sku: 'ARS-LPG-B12', category: 'LPG', stock: 85, unit: 'Cylinder', costPrice: 1200, salePrice: 1400, status: 'In Stock' },
    { name: 'Beximco LPG 22KG', sku: 'ARS-LPG-B22', category: 'LPG', stock: 30, unit: 'Cylinder', costPrice: 2200, salePrice: 2500, status: 'Low Stock' },
    { name: 'SENA LPG 12KG', sku: 'ARS-LPG-S12', category: 'LPG', stock: 120, unit: 'Cylinder', costPrice: 1150, salePrice: 1350, status: 'In Stock' },
    { name: 'SENA LPG 35KG', sku: 'ARS-LPG-S35', category: 'LPG', stock: 15, unit: 'Cylinder', costPrice: 3400, salePrice: 3800, status: 'Low Stock' },
  ];

  const corpProductIds = [];
  for (const item of corpInventory) {
    const existing = await prisma.inventory_items.findFirst({ where: { company_id: arsCorp.id, sku: item.sku } });
    if (!existing) {
      const product = await prisma.inventory_items.create({
        data: { company_id: arsCorp.id, ...item }
      });
      corpProductIds.push(product);
    } else {
      corpProductIds.push(existing);
    }
  }

  console.log('  ✅ Inventory items created\n');

  // --- 6. Create Sundry Debtors (Customers/Dealers) ---
  console.log('👥 Creating Sundry Debtors...');

  const debtors = [
    { company_id: arsLube.id, name: 'Rahim Filling Station', amount: 450000 },
    { company_id: arsLube.id, name: 'Karim Traders', amount: 300000 },
    { company_id: arsLube.id, name: 'Salam Enterprise', amount: 500000 },
    { company_id: arsCorp.id, name: 'Beximco LPG Dealer', amount: 800000 },
    { company_id: arsCorp.id, name: 'SENA Gas Supplies', amount: 1300500 },
  ];

  for (const d of debtors) {
    const existing = await prisma.sundry_debtors.findFirst({ where: { company_id: d.company_id, name: d.name } });
    if (!existing) {
      await prisma.sundry_debtors.create({
        data: {
          ...d,
          due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
    }
  }

  console.log('  ✅ Sundry Debtors created\n');

  // --- 7. Create Sundry Creditors (Suppliers) ---
  console.log('🏭 Creating Sundry Creditors...');

  const creditors = [
    { company_id: arsLube.id, name: 'Govt. Fuel Depot', amount: 1500000 },
    { company_id: arsLube.id, name: 'Lubricant Imports Inc.', amount: 1163885 },
    { company_id: arsCorp.id, name: 'Beximco Head Office', amount: 950000 },
    { company_id: arsCorp.id, name: 'SENA Head Office', amount: 900230 },
  ];

  for (const c of creditors) {
    const existing = await prisma.sundry_creditors.findFirst({ where: { company_id: c.company_id, name: c.name } });
    if (!existing) {
      await prisma.sundry_creditors.create({
        data: {
          ...c,
          originalAmount: c.amount,
          paidAmount: 0,
          due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'Pending'
        }
      });
    }
  }

  console.log('  ✅ Sundry Creditors created\n');

  // --- 8. Create Sales ---
  console.log('💰 Creating Sales...');

  const today = new Date();

  // ARS Lube Sales
  if (lubeProductIds.length > 0) {
    const salesToCreate = [
      { customer: 'Rahim Filling Station', totalAmount: 450000, status: 'Paid' },
      { customer: 'Karim Traders', totalAmount: 300000, status: 'Paid' },
      { customer: 'Local Retail Sale', totalAmount: 75200, status: 'Paid' },
      { customer: 'Salam Enterprise', totalAmount: 500000, status: 'Unpaid' },
    ];

    for (const sale of salesToCreate) {
      const existingSale = await prisma.sales.findFirst({
        where: { company_id: arsLube.id, customer: sale.customer, totalAmount: sale.totalAmount }
      });
      if (!existingSale) {
        await prisma.sales.create({
          data: {
            company_id: arsLube.id,
            customer: sale.customer,
            date: today,
            totalAmount: sale.totalAmount,
            status: sale.status,
            paymentMethod: sale.status === 'Paid' ? 'Cash' : null,
            items: {
              create: [{ product_id: lubeProductIds[0].id, quantity: 10, price: sale.totalAmount / 10 }]
            }
          }
        });
      }
    }
  }

  // ARS Corp Sales
  if (corpProductIds.length > 0) {
    const corpSales = [
      { customer: 'Beximco LPG Dealer', totalAmount: 800000, status: 'Paid' },
      { customer: 'SENA Gas Supplies', totalAmount: 1300500, status: 'Unpaid' },
      { customer: 'Local Distributor', totalAmount: 120500, status: 'Paid' },
    ];

    for (const sale of corpSales) {
      const existingSale = await prisma.sales.findFirst({
        where: { company_id: arsCorp.id, customer: sale.customer, totalAmount: sale.totalAmount }
      });
      if (!existingSale) {
        await prisma.sales.create({
          data: {
            company_id: arsCorp.id,
            customer: sale.customer,
            date: today,
            totalAmount: sale.totalAmount,
            status: sale.status,
            paymentMethod: sale.status === 'Paid' ? 'Cash' : null,
            items: {
              create: [{ product_id: corpProductIds[0].id, quantity: 5, price: sale.totalAmount / 5 }]
            }
          }
        });
      }
    }
  }

  console.log('  ✅ Sales created\n');

  // --- 9. Create Purchases ---
  console.log('📦 Creating Purchases...');

  // ARS Lube Purchases
  if (lubeProductIds.length > 0) {
    const lubePurchases = [
      { supplier: 'Govt. Fuel Depot', amount: 1356205, status: 'Paid' },
      { supplier: 'Lubricant Imports Inc.', amount: 850000, status: 'Paid' },
      { supplier: 'Padma Oil Company', amount: 1500000, status: 'Unpaid' },
    ];

    for (const purchase of lubePurchases) {
      const existing = await prisma.purchases.findFirst({
        where: { company_id: arsLube.id, supplier: purchase.supplier, amount: purchase.amount }
      });
      if (!existing) {
        await prisma.purchases.create({
          data: {
            company_id: arsLube.id,
            supplier: purchase.supplier,
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            amount: purchase.amount,
            status: purchase.status,
            items: {
              create: [{ product_id: lubeProductIds[0].id, quantity: 100, unitCost: purchase.amount / 100, total: purchase.amount }]
            }
          }
        });
      }
    }
  }

  // ARS Corp Purchases
  if (corpProductIds.length > 0) {
    const corpPurchases = [
      { supplier: 'Beximco LPG Unit', amount: 950000, status: 'Paid' },
      { supplier: 'SENA Kalyan Sangstha', amount: 900230, status: 'Paid' },
    ];

    for (const purchase of corpPurchases) {
      const existing = await prisma.purchases.findFirst({
        where: { company_id: arsCorp.id, supplier: purchase.supplier, amount: purchase.amount }
      });
      if (!existing) {
        await prisma.purchases.create({
          data: {
            company_id: arsCorp.id,
            supplier: purchase.supplier,
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            amount: purchase.amount,
            status: purchase.status,
            items: {
              create: [{ product_id: corpProductIds[0].id, quantity: 50, unitCost: purchase.amount / 50, total: purchase.amount }]
            }
          }
        });
      }
    }
  }

  console.log('  ✅ Purchases created\n');

  // --- 10. Create Expenses ---
  console.log('💸 Creating Expenses...');

  const expensesToCreate = [
    { company_id: arsLube.id, category: 'Interest Provision', description: 'Monthly interest provision', amount: 2658180, status: 'Accrued' },
    { company_id: arsLube.id, category: 'Depreciation', description: 'Monthly depreciation', amount: 1291645, status: 'Accrued' },
    { company_id: arsLube.id, category: 'Interest Charged by Bank', description: 'Bank interest', amount: 909319, status: 'Paid' },
    { company_id: arsLube.id, category: 'Staff Salary & Allowances', description: 'Monthly salaries', amount: 325000, status: 'Paid' },
    { company_id: arsLube.id, category: 'Office Rent', description: 'Monthly office rent', amount: 144000, status: 'Paid' },
    { company_id: arsCorp.id, category: 'Dealer Commission', description: 'Monthly dealer commission', amount: 1200000, status: 'Paid' },
    { company_id: arsCorp.id, category: 'Vehicle Running Costs', description: 'Fuel and maintenance', amount: 850000, status: 'Paid' },
    { company_id: arsCorp.id, category: 'Salaries & Wages', description: 'Staff salaries', amount: 450000, status: 'Paid' },
  ];

  for (const expense of expensesToCreate) {
    const existing = await prisma.expenses.findFirst({
      where: { company_id: expense.company_id, category: expense.category, amount: expense.amount }
    });
    if (!existing) {
      await prisma.expenses.create({
        data: { ...expense, date: today }
      });
    }
  }

  console.log('  ✅ Expenses created\n');

  // --- Summary ---
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ ARS ERP Database Seeding Completed!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n📌 Login Credentials:');
  console.log('   Super Owner: owner@arsgroup.com / admin123');
  console.log('   ARS Lube Manager: manager@arslube.com / admin123');
  console.log('   ARS Corp Manager: manager@arscorp.com / admin123');
  console.log('   Pump Cashier: cashier@arscorp.com / admin123');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });