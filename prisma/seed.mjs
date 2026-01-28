// prisma/seed.mjs
// ARS ERP Dashboard - Database Seeding Script

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
      permissions: {
        all: true,
        companies: ['read', 'write', 'delete', 'switch'],
        dashboard: ['owner_view', 'company_view'],
        reports: ['all'],
        settings: ['all']
      },
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
      permissions: {
        dashboard: ['company_view'],
        daily_ops: ['read', 'write', 'close_day'],
        inventory: ['read', 'write'],
        sales: ['read', 'write'],
        reports: ['company_reports'],
        expenses: ['read', 'write', 'approve']
      },
      isSystem: true
    }
  });

  const cashierRole = await prisma.role.upsert({
    where: { name: 'cashier' },
    update: {},
    create: {
      name: 'cashier',
      displayName: 'Cashier / Operator',
      description: 'Daily sales entry only',
      permissions: {
        daily_ops: ['read', 'write'],
        sales: ['create'],
        expenses: ['create']
      },
      isSystem: true
    }
  });

  console.log('  ✅ Roles created: Super Owner, Manager, Cashier\n');

  // --- 2. Create Businesses (Companies) ---
  console.log('🏢 Creating Businesses...');

  const arsCorp = await prisma.business.upsert({
    where: { code: 'ARS-CORP' },
    update: {},
    create: {
      code: 'ARS-CORP',
      name: 'ARS Corporation',
      shortName: 'ARS Corp',
      type: 'PETROL_PUMP',
      address: 'Dhaka, Bangladesh',
      phone: '+880-XXX-XXXXXX',
      settings: {
        currency: 'BDT',
        currencySymbol: '৳',
        timezone: 'Asia/Dhaka',
        dateFormat: 'DD/MM/YYYY',
        lossThreshold: 0.4, // 0.4% permissible loss
        dayCloseTolerance: 100 // ±100 BDT variance allowed
      }
    }
  });

  const arsLube = await prisma.business.upsert({
    where: { code: 'ARS-LUBE' },
    update: {},
    create: {
      code: 'ARS-LUBE',
      name: 'ARS Lube',
      shortName: 'ARS Lube',
      type: 'LUBRICANT',
      address: 'Dhaka, Bangladesh',
      phone: '+880-XXX-XXXXXX',
      settings: {
        currency: 'BDT',
        currencySymbol: '৳',
        timezone: 'Asia/Dhaka',
        dateFormat: 'DD/MM/YYYY',
        fifoEnabled: true,
        defaultCreditDays: 30
      }
    }
  });

  console.log('  ✅ Businesses created: ARS Corporation, ARS Lube\n');

  // --- 3. Create Branches ---
  console.log('🏭 Creating Branches...');

  const mainBranch = await prisma.branch.upsert({
    where: { businessId_code: { businessId: arsCorp.id, code: 'MAIN' } },
    update: {},
    create: {
      businessId: arsCorp.id,
      code: 'MAIN',
      name: 'Main Fuel Station',
      address: 'Main Road, Dhaka',
      settings: {
        hasGasCylinders: true,
        hasFuel: true,
        hasLubricants: true
      }
    }
  });

  const lubeBranch = await prisma.branch.upsert({
    where: { businessId_code: { businessId: arsLube.id, code: 'HQ' } },
    update: {},
    create: {
      businessId: arsLube.id,
      code: 'HQ',
      name: 'Lube Distribution Center',
      address: 'Industrial Area, Dhaka'
    }
  });

  console.log('  ✅ Branches created: Main Fuel Station, Lube Distribution Center\n');

  // --- 4. Create Users ---
  console.log('👥 Creating Users...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Super Owner - access to all companies
  const superOwner = await prisma.user.upsert({
    where: { email: 'owner@arsgroup.com' },
    update: { password: hashedPassword },
    create: {
      email: 'owner@arsgroup.com',
      password: hashedPassword,
      name: 'Md Iqbal Haider Khan',
      phone: '+880-XXX-XXXXXX',
      roleId: superOwnerRole.id,
      businessId: null // null = access to all
    }
  });

  // ARS Corp Manager
  const corpManager = await prisma.user.upsert({
    where: { email: 'manager@arscorp.com' },
    update: { password: hashedPassword },
    create: {
      email: 'manager@arscorp.com',
      password: hashedPassword,
      name: 'ARS Corp Manager',
      roleId: managerRole.id,
      businessId: arsCorp.id
    }
  });

  // ARS Lube Manager
  const lubeManager = await prisma.user.upsert({
    where: { email: 'manager@arslube.com' },
    update: { password: hashedPassword },
    create: {
      email: 'manager@arslube.com',
      password: hashedPassword,
      name: 'ARS Lube Manager',
      roleId: managerRole.id,
      businessId: arsLube.id
    }
  });

  // Cashier
  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@arscorp.com' },
    update: { password: hashedPassword },
    create: {
      email: 'cashier@arscorp.com',
      password: hashedPassword,
      name: 'Pump Cashier',
      roleId: cashierRole.id,
      businessId: arsCorp.id
    }
  });

  console.log('  ✅ Users created:');
  console.log('     - Super Owner: owner@arsgroup.com (password: admin123)');
  console.log('     - ARS Corp Manager: manager@arscorp.com');
  console.log('     - ARS Lube Manager: manager@arslube.com');
  console.log('     - Cashier: cashier@arscorp.com\n');

  // --- 5. Create Fuel Types (ARS Corp) ---
  console.log('⛽ Creating Fuel Types...');

  const fuelTypes = [
    { code: 'PETROL', name: 'Petrol (Octane)', price: 130.00, density: 0.7429 },
    { code: 'DIESEL', name: 'Diesel', price: 115.00, density: 0.8320 },
    { code: 'OCTANE', name: 'High Octane', price: 135.00, density: 0.7550 }
  ];

  for (const fuel of fuelTypes) {
    await prisma.fuelType.upsert({
      where: { businessId_code: { businessId: arsCorp.id, code: fuel.code } },
      update: { currentPrice: fuel.price },
      create: {
        businessId: arsCorp.id,
        code: fuel.code,
        name: fuel.name,
        currentPrice: fuel.price,
        density: fuel.density,
        permissibleLoss: 0.25
      }
    });
  }

  console.log('  ✅ Fuel Types created: Petrol, Diesel, High Octane\n');

  // --- 6. Create Cylinder Types ---
  console.log('🔵 Creating Cylinder Types...');

  const cylinderTypes = [
    { name: '12 KG Domestic', weight: 12.00, deposit: 1500, price: 1250 },
    { name: '35 KG Commercial', weight: 35.00, deposit: 3500, price: 3100 },
    { name: '45 KG Industrial', weight: 45.00, deposit: 5000, price: 3900 }
  ];

  for (const cyl of cylinderTypes) {
    await prisma.cylinderType.upsert({
      where: { id: `CYL-${cyl.weight}` },
      update: { currentPrice: cyl.price },
      create: {
        id: `CYL-${cyl.weight}`,
        name: cyl.name,
        weight: cyl.weight,
        depositAmount: cyl.deposit,
        currentPrice: cyl.price
      }
    });
  }

  console.log('  ✅ Cylinder Types created: 12KG, 35KG, 45KG\n');

  // --- 7. Create Expense Categories ---
  console.log('💰 Creating Expense Categories...');

  const expenseCategories = [
    { code: 'SALARY', name: 'Staff Salaries', icon: 'banknotes' },
    { code: 'ELEC', name: 'Electricity Bill', icon: 'bolt' },
    { code: 'TEA', name: 'Tea/Snacks', icon: 'cup-soda' },
    { code: 'MAINT', name: 'Maintenance', icon: 'wrench' },
    { code: 'GOVT', name: 'Government Fees', icon: 'building-library' },
    { code: 'TRANSPORT', name: 'Transport/Fuel', icon: 'truck' },
    { code: 'MISC', name: 'Miscellaneous', icon: 'ellipsis-horizontal' }
  ];

  // Note: ExpenseCategory model needs to be added to schema
  // For now, we'll skip this if the model doesn't exist

  console.log('  ✅ Expense Categories defined (will be created when model is added)\n');

  // --- Summary ---
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ ARS ERP Database Seeding Completed!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('📌 Login Credentials:');
  console.log('   Super Owner: owner@arsgroup.com / admin123');
  console.log('   ARS Corp Manager: manager@arscorp.com / admin123');
  console.log('   ARS Lube Manager: manager@arslube.com / admin123');
  console.log('   Cashier: cashier@arscorp.com / admin123');
  console.log('');
  console.log('🏢 Companies:');
  console.log('   - ARS Corporation (Fuel Station + Gas Cylinders)');
  console.log('   - ARS Lube (Lubricant Distribution)');
  console.log('');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });