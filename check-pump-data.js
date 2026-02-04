// Diagnostic script to check if Pump data exists in the database
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkPumpData() {
    try {
        console.log('🔍 Checking Database Connection...');
        
        // 1. Check Businesses
        const businesses = await prisma.business.findMany();
        console.log(`\n📊 Businesses: ${businesses.length} found`);
        businesses.forEach(b => console.log(`  - ${b.name} (${b.type}) - ID: ${b.id}`));
        
        // 2. Check Branches
        const branches = await prisma.branch.findMany({ include: { business: true } });
        console.log(`\n🏢 Branches: ${branches.length} found`);
        branches.forEach(b => console.log(`  - ${b.name} (${b.business.name}) - ID: ${b.id}`));
        
        // 3. Check Pumps
        const pumps = await prisma.pump.findMany({ include: { branch: true } });
        console.log(`\n⛽ Pumps: ${pumps.length} found`);
        pumps.forEach(p => console.log(`  - Pump ${p.pumpNumber} at ${p.branch.name} - ID: ${p.id}`));
        
        // 4. Check Nozzles
        const nozzles = await prisma.nozzle.findMany({ include: { pump: true, fuelType: true } });
        console.log(`\n🔧 Nozzles: ${nozzles.length} found`);
        nozzles.forEach(n => console.log(`  - Nozzle ${n.nozzleNumber} on Pump ${n.pump.pumpNumber} (${n.fuelType.name})`));
        
        // 5. Check Storage Tanks
        const tanks = await prisma.storageTank.findMany({ include: { fuelType: true } });
        console.log(`\n🛢️  Storage Tanks: ${tanks.length} found`);
        tanks.forEach(t => console.log(`  - Tank ${t.tankNumber} (${t.fuelType.name}) - Capacity: ${t.capacity}`));
        
        // 6. Check Dip Readings
        const dipReadings = await prisma.dipReading.findMany({ take: 5, orderBy: { readingDate: 'desc' } });
        console.log(`\n📏 Recent Dip Readings: ${dipReadings.length} found (showing last 5)`);
        dipReadings.forEach(d => console.log(`  - ${d.readingDate}: ${d.openingStock} -> ${d.closingStock}`));
        
        // 7. Check Cylinder Stock
        const cylinderStock = await prisma.cylinderStock.findMany({ include: { cylinderType: true } });
        console.log(`\n🔥 Cylinder Stock: ${cylinderStock.length} found`);
        cylinderStock.forEach(c => console.log(`  - ${c.cylinderType.name}: ${c.quantityFilled} filled, ${c.quantityEmpty} empty`));
        
        console.log('\n✅ Database check complete!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

checkPumpData();
