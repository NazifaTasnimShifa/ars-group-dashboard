// Pump Infrastructure Seed Script (Uses Existing Fuel Types)
// Seeds: Storage Tanks, Pumps, Nozzles, Cylinder Types, Cylinder Stock
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPumpInfrastructure() {
    try {
        console.log('⛽ Starting Pump Infrastructure Seeding...\n');

        // Get ARS Corporation and Main Branch
        const arsCorp = await prisma.business.findUnique({ where: { code: 'ARS-CORP' } });
        if (!arsCorp) {
            console.error('❌ ARS Corporation not found!');
            return;
        }

        const mainBranch = await prisma.branch.findFirst({ 
            where: { businessId: arsCorp.id, code: 'MAIN' } 
        });
        if (!mainBranch) {
            console.error('❌ Main Branch not found!');
            return;
        }

        console.log(`✅ Found: ${arsCorp.name} - ${mainBranch.name}\n`);

        // 1. Get Existing Fuel Types
        console.log('⛽ Fetching Existing Fuel Types...');
        const fuelTypes = await prisma.fuelType.findMany({ 
            where: { businessId: arsCorp.id } 
        });
        console.log(`  ✅ Found ${fuelTypes.length} fuel types:`);
        fuelTypes.forEach(ft => console.log(`     - ${ft.name} (${ft.code})`));

        if (fuelTypes.length === 0) {
            console.error('❌ No fuel types found! Cannot create tanks/nozzles.');
            return;
        }

        // Map for easy lookup
        const petrol = fuelTypes.find(f => f.code === 'PETROL' || f.code === 'OCTANE');
        const diesel = fuelTypes.find(f => f.code === 'DIESEL');

        if (!petrol || !diesel) {
            console.error('❌ Required fuel types (PETROL/DIESEL) not found!');
            return;
        }

        // 2. Create Storage Tanks
        console.log('\n🛢️  Creating Storage Tanks...');
        const tankData = [
            { tankNumber: 'T1', fuelTypeId: petrol.id, capacityLiters: 10000, currentStock: 8500 },
            { tankNumber: 'T2', fuelTypeId: petrol.id, capacityLiters: 8000, currentStock: 6200 },
            { tankNumber: 'T3', fuelTypeId: diesel.id, capacityLiters: 15000, currentStock: 12000 },
            { tankNumber: 'T4', fuelTypeId: diesel.id, capacityLiters: 10000, currentStock: 8500 },
        ];

        const tanks = [];
        for (const td of tankData) {
            const existing = await prisma.storageTank.findUnique({
                where: { branchId_tankNumber: { branchId: mainBranch.id, tankNumber: td.tankNumber } }
            });
            if (!existing) {
                const created = await prisma.storageTank.create({ 
                    data: { ...td, branchId: mainBranch.id },
                    include: { fuelType: true }
                });
                tanks.push(created);
                console.log(`  ✅ Tank ${created.tankNumber} (${created.fuelType.name}) - ${created.currentStock}/${created.capacityLiters}L`);
            } else {
                tanks.push(existing);
                console.log(`  ⏭️  Tank ${existing.tankNumber} (already exists)`);
            }
        }

        // 3. Create Pumps
        console.log('\n⛽ Creating Pumps...');
        const pumpData = [
            { pumpNumber: 'P1', make: 'Tokheim', model: 'TCS-4000', isMpu: true },
            { pumpNumber: 'P2', make: 'Wayne', model: 'Helix-6000', isMpu: true },
            { pumpNumber: 'P3', make: 'Tokheim', model: 'TCS-4000', isMpu: false },
            { pumpNumber: 'P4', make: 'Gilbarco', model: 'Encore-500', isMpu: false },
        ];

        const pumps = [];
        for (const pd of pumpData) {
            const existing = await prisma.pump.findUnique({
                where: { branchId_pumpNumber: { branchId: mainBranch.id, pumpNumber: pd.pumpNumber } }
            });
            if (!existing) {
                const created = await prisma.pump.create({ 
                    data: { ...pd, branchId: mainBranch.id }
                });
                pumps.push(created);
                console.log(`  ✅ Pump ${created.pumpNumber} (${created.make} ${created.model})`);
            } else {
                pumps.push(existing);
                console.log(`  ⏭️  Pump ${existing.pumpNumber} (already exists)`);
            }
        }

        // 4. Create Nozzles (4 per pump)
        console.log('\n🔧 Creating Nozzles...');
        const nozzleData = [
            // Pump 1 - Petrol
            { pumpId: pumps[0].id, tankId: tanks[0].id, fuelTypeId: petrol.id, nozzleNumber: '1', currentMeterReading: 125340.50 },
            { pumpId: pumps[0].id, tankId: tanks[0].id, fuelTypeId: petrol.id, nozzleNumber: '2', currentMeterReading: 98420.75 },
            { pumpId: pumps[0].id, tankId: tanks[1].id, fuelTypeId: petrol.id, nozzleNumber: '3', currentMeterReading: 45230.25 },
            { pumpId: pumps[0].id, tankId: tanks[1].id, fuelTypeId: petrol.id, nozzleNumber: '4', currentMeterReading: 52180.00 },
            // Pump 2 - Diesel
            { pumpId: pumps[1].id, tankId: tanks[2].id, fuelTypeId: diesel.id, nozzleNumber: '1', currentMeterReading: 234560.50 },
            { pumpId: pumps[1].id, tankId: tanks[2].id, fuelTypeId: diesel.id, nozzleNumber: '2', currentMeterReading: 198750.25 },
            { pumpId: pumps[1].id, tankId: tanks[3].id, fuelTypeId: diesel.id, nozzleNumber: '3', currentMeterReading: 145890.75 },
            { pumpId: pumps[1].id, tankId: tanks[3].id, fuelTypeId: diesel.id, nozzleNumber: '4', currentMeterReading: 167230.50 },
            // Pump 3 - Mixed
            { pumpId: pumps[2].id, tankId: tanks[0].id, fuelTypeId: petrol.id, nozzleNumber: '1', currentMeterReading: 87650.00 },
            { pumpId: pumps[2].id, tankId: tanks[0].id, fuelTypeId: petrol.id, nozzleNumber: '2', currentMeterReading: 92340.50 },
            { pumpId: pumps[2].id, tankId: tanks[2].id, fuelTypeId: diesel.id, nozzleNumber: '3', currentMeterReading: 156780.25 },
            { pumpId: pumps[2].id, tankId: tanks[2].id, fuelTypeId: diesel.id, nozzleNumber: '4', currentMeterReading: 134520.75 },
            // Pump 4 - Mixed
            { pumpId: pumps[3].id, tankId: tanks[0].id, fuelTypeId: petrol.id, nozzleNumber: '1', currentMeterReading: 67890.00 },
            { pumpId: pumps[3].id, tankId: tanks[1].id, fuelTypeId: petrol.id, nozzleNumber: '2', currentMeterReading: 54320.50 },
            { pumpId: pumps[3].id, tankId: tanks[2].id, fuelTypeId: diesel.id, nozzleNumber: '3', currentMeterReading: 178540.25 },
            { pumpId: pumps[3].id, tankId: tanks[3].id, fuelTypeId: diesel.id, nozzleNumber: '4', currentMeterReading: 145670.75 },
        ];

        let nozzleCount = 0;
        for (const nd of nozzleData) {
            const existing = await prisma.nozzle.findUnique({
                where: { pumpId_nozzleNumber: { pumpId: nd.pumpId, nozzleNumber: nd.nozzleNumber } }
            });
            if (!existing) {
                await prisma.nozzle.create({ data: nd });
                nozzleCount++;
            }
        }
        console.log(`  ✅ Created ${nozzleCount} nozzles (${nozzleData.length - nozzleCount} already existed)`);

        // 5. Create Cylinder Types
        console.log('\n🔥 Creating Cylinder Types...');
        const cylinderTypes = [
            { businessId: arsCorp.id, code: 'LPG-12', name: 'LPG 12KG', weight: 12 },
            { businessId: arsCorp.id, code: 'LPG-22', name: 'LPG 22KG (Commercial)', weight: 22 },
            { businessId: arsCorp.id, code: 'LPG-35', name: 'LPG 35KG (Industrial)', weight: 35 },
        ];

        const cylTypes = [];
        for (const ct of cylinderTypes) {
            const existing = await prisma.cylinderType.findFirst({
                where: { businessId: ct.businessId, code: ct.code }
            });
            if (!existing) {
                const created = await prisma.cylinderType.create({ data: ct });
                cylTypes.push(created);
                console.log(`  ✅ ${created.name}`);
            } else {
                cylTypes.push(existing);
                console.log(`  ⏭️  ${existing.name} (already exists)`);
            }
        }

        // 6. Create Cylinder Stock
        console.log('\n📦 Creating Cylinder Stock...');
        const stockData = [
            { branchId: mainBranch.id, cylinderTypeId: cylTypes[0].id, quantityFilled: 85, quantityEmpty: 15 },
            { branchId: mainBranch.id, cylinderTypeId: cylTypes[1].id, quantityFilled: 45, quantityEmpty: 8 },
            { branchId: mainBranch.id, cylinderTypeId: cylTypes[2].id, quantityFilled: 12, quantityEmpty: 3 },
        ];

        for (const sd of stockData) {
            const existing = await prisma.cylinderStock.findFirst({
                where: { branchId: sd.branchId, cylinderTypeId: sd.cylinderTypeId }
            });
            if (!existing) {
                const created = await prisma.cylinderStock.create({ 
                    data: sd,
                    include: { cylinderType: true }
                });
                console.log(`  ✅ ${created.cylinderType.name}: ${created.quantityFilled} filled, ${created.quantityEmpty} empty`);
            } else {
                console.log(`  ⏭️  Cylinder stock (already exists)`);
            }
        }

        console.log('\n═══════════════════════════════════════');
        console.log('✅ Pump Infrastructure Seeding Complete!');
        console.log('═══════════════════════════════════════\n');
        console.log(`📊 Summary:`);
        console.log(`   - ${fuelTypes.length} Fuel Types (existing)`);
        console.log(`   - ${tanks.length} Storage Tanks`);
        console.log(`   - ${pumps.length} Pumps`);
        console.log(`   - ${nozzleData.length} Nozzles`);
        console.log(`   - ${cylTypes.length} Cylinder Types`);
        console.log(`   - ${stockData.length} Cylinder Stock Records\n`);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedPumpInfrastructure();
