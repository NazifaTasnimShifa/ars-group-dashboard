// Script to add brand column and update cylinder types with brands
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCylinderTypes() {
  console.log('Updating Cylinder Types with Brands...\n');

  // Delete existing cylinder types
  await prisma.cylinderType.deleteMany({});
  console.log('✅ Cleared existing cylinder types\n');

  // New cylinder types with brands
  const cylinderTypesData = [
    // Beximco
    { name: 'Beximco 12 KG Domestic', brand: 'Beximco', weight: 12, depositAmount: 1500, currentPrice: 1400 },
    { name: 'Beximco 35 KG Commercial', brand: 'Beximco', weight: 35, depositAmount: 3500, currentPrice: 3800 },
    { name: 'Beximco 45 KG Industrial', brand: 'Beximco', weight: 45, depositAmount: 4500, currentPrice: 4800 },
    
    // Sena
    { name: 'Sena 12 KG Domestic', brand: 'Sena', weight: 12, depositAmount: 1500, currentPrice: 1350 },
    { name: 'Sena 35 KG Commercial', brand: 'Sena', weight: 35, depositAmount: 3500, currentPrice: 3700 },
    { name: 'Sena 45 KG Industrial', brand: 'Sena', weight: 45, depositAmount: 4500, currentPrice: 4700 },
    
    // Jamuna
    { name: 'Jamuna 12 KG Domestic', brand: 'Jamuna', weight: 12, depositAmount: 1500, currentPrice: 1420 },
    { name: 'Jamuna 35 KG Commercial', brand: 'Jamuna', weight: 35, depositAmount: 3500, currentPrice: 3850 },
    
    // Bashundhara
    { name: 'Bashundhara 12 KG Domestic', brand: 'Bashundhara', weight: 12, depositAmount: 1500, currentPrice: 1380 },
    { name: 'Bashundhara 35 KG Commercial', brand: 'Bashundhara', weight: 35, depositAmount: 3500, currentPrice: 3750 },
  ];

  for (const ct of cylinderTypesData) {
    const created = await prisma.cylinderType.create({ data: ct });
    console.log(`  ✅ Created: ${ct.brand} ${ct.weight}KG`);
  }

  console.log('\n✅ Done! Created', cylinderTypesData.length, 'cylinder types');
  await prisma.$disconnect();
}

updateCylinderTypes().catch(e => {
  console.error('Error:', e);
  prisma.$disconnect();
  process.exit(1);
});
