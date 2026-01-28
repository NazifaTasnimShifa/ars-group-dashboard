// test-db.mjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing database connection...');
    
    // Test 1: Find first user
    const user = await prisma.user.findFirst({
      include: { role: true, business: true }
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log('   Email:', user.email);
      console.log('   Name:', user.name);
      console.log('   Role:', user.role?.displayName);
      console.log('   Business:', user.business?.name || 'None (Super Owner)');
    } else {
      console.log('❌ No users found in database');
    }

    // Test 2: Count businesses
    const businessCount = await prisma.business.count();
    console.log(`\n📊 Total businesses: ${businessCount}`);

    // Test 3: List all users
    const allUsers = await prisma.user.findMany({
      select: { email: true, name: true }
    });
    console.log('\n👥 All users:');
    allUsers.forEach(u => console.log(`   - ${u.email} (${u.name})`));

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
