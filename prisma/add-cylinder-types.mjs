// Script to add cylinder types to the database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addCylinderTypes() {
  console.log('Adding Cylinder Types...');

  const cylinderTypesData = [
    { name: '12 KG Domestic', weight: 12, depositAmount: 1500, currentPrice: 1400 },
    { name: '35 KG Commercial', weight: 35, depositAmount: 3500, currentPrice: 3800 },
    { name: '45 KG Industrial', weight: 45, depositAmount: 4500, currentPrice: 4800 },
  ];

  for (const ct of cylinderTypesData) {
    const existing = await prisma.cylinderType.findFirst({ where: { name: ct.name } });
    if (!existing) {
      await prisma.cylinderType.create({ data: ct });
      console.log(`  ✅ Created: ${ct.name}`);
    } else {
      console.log(`  ⏭️ Skipped (exists): ${ct.name}`);
    }
  }

  console.log('Done!');
  await prisma.$disconnect();
}

addCylinderTypes().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
