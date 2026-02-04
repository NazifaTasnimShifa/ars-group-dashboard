import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkFuelTypes() {
    const fuelTypes = await prisma.fuelType.findMany({ include: { business: true } });
    console.log('Existing Fuel Types:', JSON.stringify(fuelTypes, null, 2));
    await prisma.$disconnect();
}

checkFuelTypes();
