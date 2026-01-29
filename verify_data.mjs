
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const sales = await prisma.sales.count();
        const purchases = await prisma.purchases.count();
        const inventory = await prisma.inventory_items.count();

        console.log(`Sales: ${sales}`);
        console.log(`Purchases: ${purchases}`);
        console.log(`Inventory: ${inventory}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
