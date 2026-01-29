
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const sales = await prisma.sales.count();
    const purchases = await prisma.purchases.count();
    const inventory = await prisma.inventory_items.count();
    const debtors = await prisma.sundry_debtors.count();
    const creditors = await prisma.sundry_creditors.count();

    console.log(`Sales: ${sales}`);
    console.log(`Purchases: ${purchases}`);
    console.log(`Inventory: ${inventory}`);
    console.log(`Debtors: ${debtors}`);
    console.log(`Creditors: ${creditors}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
