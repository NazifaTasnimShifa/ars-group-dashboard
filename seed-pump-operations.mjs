// Pump Operations Seed Script
// Seeds: Fuel Types, Storage Tanks, Pumps, Nozzles, Cylinder Types, Cylinder Stock
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPumpOperations() {
    try {
        console.log('⛽ Starting Pump Operations Seeding...\n');

        // Get ARS Corporation and Main Branch
        const arsCorp = await prisma.business.findUnique({ where: { code: 'ARS-CORP' } });
        if (!arsCorp) {
            console.error('❌ ARS Corporation not found! Run main seed first.');
            return;
        }

        const mainBranch = await prisma.branch.findFirst({ 
            where: { businessId: arsCorp.id, code: 'MAIN' } 
        });
        if (!mainBranch) {
            console.error('❌ Main Branch not found! Run main seed first.');
            return;
        }

        console.log(`✅ Found: ${arsCorp.name} - ${mainBranch.name}\n`);

        // 1. Create Fuel Types
        console.log('⛽ Creating Fuel Types...');
        const fuelTypes = [
            { businessId: arsCorp.id, code: 'OCTANE', name: 'Petrol (Octane 95)', unit: 'Litre', currentPrice: 130.00, color: '#FF6B6B' },
            { businessId: arsCorp.id, code: 'OCTANE_97', name: 'Petrol (Octane 97)', unit: 'Litre', currentPrice: 135.00, color: '#4ECDC4' },
            { businessId: arsCorp.id, code: 'DIESEL', name: 'Diesel', unit: 'Litre', currentPrice: 110.00, color: '#95E1D3' },
            { businessId: arsCorp.id, code: 'CNG', name: 'CNG', unit: 'Cubic Meter', currentPrice: 65.00, color: '#FFA502' },
        ];

        const createdFuelTypes = [];
        for (const ft of fuelTypes) {
            const existing = await prisma.fuelType.findUnique({ 
                where: { businessId_code: { businessId: ft.businessId, code: ft.code } } 
            });
            if (!existing) {
                const created = await prisma.fuelType.create({ data: ft });
                createdFuelTypes.push(created);
                console.log(`  ✅ ${created.name}`);
            } else {
                createdFuelTypes.push(existing);
                console.log(`  ⏭️  ${existing.name} (already exists)`);
            }
        }

        // 2. Create Storage Tanks
        console.log('\n🛢️  Creating Storage Tanks...');
        const tanks = [
            { branchId: mainBranch.id, tankNumber: 'T1', fuelTypeId: createdFuelTypes[0].id, capacityLiters: 10000, currentStock: 8500 },
            { branchId: mainBranch.id, tankNumber: 'T2', fuelTypeId: createdFuelTypes[1].id, capacityLiters: 8000, currentStock: 6200 },
            { branchId: mainBranch.id, tankNumber: 'T3', fuelTypeId: createdFuelTypes[2].id, capacityLiters: 15000, currentStock: 12000 },
            { branchId: mainBranch.id, tankNumber: 'T4', fuelTypeId: createdFuelTypes[2].id, capacityLiters: 10000, currentStock: 8500 },
        ];

        const createdTanks = [];
        for (const tank of tanks) {
            const existing = await prisma.storageTank.findUnique({
                where: { branchId_tankNumber: { branchId: tank.branchId, tankNumber: tank.tankNumber } }
            });
            if (!existing) {
                const created = await prisma.storageTank.create({ data: tank, include: { fuelType: true } });
                createdTanks.push(created);
                console.log(`  ✅ Tank ${created.tankNumber} (${created.fuelType.name}) - ${created.currentStock}/${created.capacityLiters}L`);
            } else {
                createdTanks.push(existing);
                console.log(`  ⏭️  Tank ${existing.tankNumber} (already exists)`);
            }
        }

        // 3. Create Pumps
        console.log('\n⛽ Creating Pumps...');
        const pumps = [
            { branchId: mainBranch.id, pumpNumber: 'P1', make: 'Tokheim', model: 'TCS-4000', isMpu: true },
            { branchId: mainBranch.id, pumpNumber: 'P2', make: 'Wayne', model: 'Helix-6000', isMpu: true },
            { branchId: mainBranch.id, pumpNumber: 'P3', make: 'Tokheim', model: 'TCS-4000', isMpu: false },
            { branchId: mainBranch.id, pumpNumber: 'P4', make: 'Gilbarco', model: 'Encore-500', isMpu: false },
        ];

        const createdPumps = [];
        for (const pump of pumps) {
            const existing = await prisma.pump.findUnique({
                where: { branchId_pumpNumber: { branchId: pump.branchId, pumpNumber: pump.pumpNumber } }
            });
            if (!existing) {
                const created = await prisma.pump.create({ data: pump });
                createdPumps.push(created);
                console.log(`  ✅ Pump ${created.pumpNumber} (${created.make} ${created.model})`);
            } else {
                createdPumps.push(existing);
                console.log(`  ⏭️  Pump ${existing.pumpNumber} (already exists)`);
            }
        }

        // 4. Create Nozzles
        console.log('\n🔧 Creating Nozzles...');
        const nozzles = [
            // Pump 1 - 4 Nozzles (Octane & Octane 97)
            { pumpId: createdPumps[0].id, tankId: createdTanks[0].id, fuelTypeId: createdFuelTypes[0].id, nozzleNumber: '1', currentMeterReading: 125340.50 },
            { pumpId: createdPumps[0].id, tankId: createdTanks[0].id, fuelTypeId: createdFuelTypes[0].id, nozzleNumber: '2', currentMeterReading: 98420.75 },
            { pumpId: createdPumps[0].id, tankId: createdTanks[1].id, fuelTypeId: createdFuelTypes[1].id, nozzleNumber: '3', currentMeterReading: 45230.25 },
            { pumpId: createdPumps[0].id, tankId: createdTanks[1].id, fuelTypeId: createdFuelTypes[1].id, nozzleNumber: '4', currentMeterReading: 52180.00 },
            
            // Pump 2 - 4 Nozzles (Diesel)
            { pumpId: createdPumps[1].id, tankId: createdTanks[2].id, fuelTypeId: createdFuelTypes[2].id, nozzleNumber: '1', currentMeterReading: 234560.50 },
            { pumpId: createdPumps[1].id, tankId: createdTanks[2].id, fuelTypeId: createdFuelTypes[2].id, nozzleNumber: '2', currentMeterReading: 198750.25 },
            { pumpId: createdPumps[1].id, tankId: createdTanks[3].id, fuelTypeId: createdFuelTypes[2].id, nozzleNumber: '3', currentMeterReading: 145890.75 },
            { pumpId: createdPumps[1].id, tankId: createdTanks[3].id, fuelTypeId: createdFuelTypes[2].id, nozzleNumber: '4', currentMeterReading: 167230.50 },
            
            // Pump 3 - 4 Nozzles (Mixed)
            { pumpId: createdPumps[2].id, tankId: createdTanks[0].id, fuelTypeId: createdFuelTypes[0].id, nozzleNumber: '1', currentMeterReading: 87650.00 },
            { pumpId: createdPumps[2].id, tankId: createdTanks[0].id, fuelTypeId: createdFuelTypes[0].id, nozzleNumber: '2', currentMeterReading: 92340.50 },
            { pumpId: createdPumps[2].id, tankId: createdTanks[2].id, fuelTypeId: createdFuelTypes[2].id, nozzleNumber: '3', currentMeterReading: 156780.25 },
            { pumpId: createdPumps[2].id, tankId: createdTanks[2].id, fuelTypeId: createdFuelTypes[2].id, nozzleNumber: '4', currentMeterReading: 134520.75 },
            
            // Pump 4 - 4 Nozzles (All types)
            { pumpId: createdPumps[3].id, tankId: createdTanks[0].id, fuelTypeId: createdFuelTypes[0].id, nozzleNumber: '1', currentMeterReading: 67890.00 },
            { pumpId: createdPumps[3].id, tankId: createdTanks[1].id, fuelTypeId: createdFuelTypes[1].id, nozzleNumber: '2', currentMeterReading: 54320.50 },
            { pumpId: createdPumps[3].id, tankId: createdTanks[2].id, fuelTypeId: createdFuelTypes[2].id, nozzleNumber: '3', currentMeterReading: 178540.25 },
            { pumpId: createdPumps[3].id, tankId: createdTanks[3].id, fuelTypeId: createdFuelTypes[2].id, nozzleNumber: '4', currentMeterReading: 145670.75 },
        ];

        for (const nozzle of nozzles) {
            const existing = await prisma.nozzle.findUnique({
                where: { pumpId_nozzleNumber: { pumpId: nozzle.pumpId, nozzleNumber: nozzle.nozzleNumber } }
            });
            if (!existing) {
                const created = await prisma.nozzle.create({ 
                    data: nozzle,
                    include: { pump: true, fuelType: true }
                });
                console.log(`  ✅ Nozzle ${created.nozzleNumber} on Pump ${created.pump.pumpNumber} (${created.fuelType.name})`);
            } else {
                console.log(`  ⏭️  Nozzle ${existing.nozzleNumber} on pump (already exists)`);
            }
        }

        // 5. Create Cylinder Types
        console.log('\n🔥 Creating Cylinder Types...');
        const cylinderTypes = [
            { businessId: arsCorp.id, code: 'LPG-12', name: 'LPG 12KG', weight: 12 },
            { businessId: arsCorp.id, code: 'LPG-22', name: 'LPG 22KG (Commercial)', weight: 22 },
            { businessId: arsCorp.id, code: 'LPG-35', name: 'LPG 35KG (Industrial)', weight: 35 },
            { businessId: arsCorp.id, code: 'LPG-45', name: 'LPG 45KG (Industrial)', weight: 45 },
        ];

        const createdCylinderTypes = [];
        for (const ct of cylinderTypes) {
            const existing = await prisma.cylinderType.findUnique({
                where: { businessId_code: { businessId: ct.businessId, code: ct.code } }
            });
            if (!existing) {
                const created = await prisma.cylinderType.create({ data: ct });
                createdCylinderTypes.push(created);
                console.log(`  ✅ ${created.name}`);
            } else {
                createdCylinderTypes.push(existing);
                console.log(`  ⏭️  ${existing.name} (already exists)`);
            }
        }

        // 6. Create Cylinder Stock
        console.log('\n📦 Creating Cylinder Stock...');
        const cylinderStock = [
            { branchId: mainBranch.id, cylinderTypeId: createdCylinderTypes[0].id, quantityFilled: 85, quantityEmpty: 15 },
            { branchId: mainBranch.id, cylinderTypeId: createdCylinderTypes[1].id, quantityFilled: 45, quantityEmpty: 8 },
            { branchId: mainBranch.id, cylinderTypeId: createdCylinderTypes[2].id, quantityFilled: 12, quantityEmpty: 3 },
            { branchId: mainBranch.id, cylinderTypeId: createdCylinderTypes[3].id, quantityFilled: 6, quantityEmpty: 4 },
        ];

        for (const stock of cylinderStock) {
            const existing = await prisma.cylinderStock.findUnique({
                where: { branchId_cylinderTypeId: { branchId: stock.branchId, cylinderTypeId: stock.cylinderTypeId } }
            });
            if (!existing) {
                const created = await prisma.cylinderStock.create({ 
                    data: stock,
                    include: { cylinderType: true }
                });
                console.log(`  ✅ ${created.cylinderType.name}: ${created.quantityFilled} filled, ${created.quantityEmpty} empty`);
            } else {
                console.log(`  ⏭️  Cylinder stock (already exists)`);
            }
        }

        console.log('\n═══════════════════════════════════════');
        console.log('✅ Pump Operations Seeding Complete!');
        console.log('═══════════════════════════════════════\n');
        console.log(`📊 Summary:`);
        console.log(`   - ${createdFuelTypes.length} Fuel Types`);
        console.log(`   - ${createdTanks.length} Storage Tanks`);
        console.log(`   - ${createdPumps.length} Pumps`);
        console.log(`   - ${nozzles.length} Nozzles`);
        console.log(`   - ${createdCylinderTypes.length} Cylinder Types`);
        console.log(`   - ${cylinderStock.length} Cylinder Stock Records\n`);

    } catch (error) {
        console.error('❌ Pump seeding failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedPumpOperations();
