const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bloodsys.com' },
    update: {},
    create: {
      email: 'admin@bloodsys.com',
      name: 'System Admin',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // 2. Create Hospital
  const hospital = await prisma.user.upsert({
    where: { email: 'cityhospital@bloodsys.com' },
    update: {},
    create: {
      email: 'cityhospital@bloodsys.com',
      name: 'City Central Hospital',
      passwordHash,
      role: 'HOSPITAL',
      lat: 40.7128,
      lng: -74.0060,
    },
  });

  // 3. Create Blood Bank
  const bank = await prisma.user.upsert({
    where: { email: 'centralbank@bloodsys.com' },
    update: {},
    create: {
      email: 'centralbank@bloodsys.com',
      name: 'Central Blood Bank',
      passwordHash,
      role: 'BLOOD_BANK',
      lat: 40.7138,
      lng: -74.0070,
      bloodBankInventory: {
        create: [
          { bloodGroup: 'O+', unitsAvailable: 10 },
          { bloodGroup: 'A+', unitsAvailable: 5 },
          { bloodGroup: 'B-', unitsAvailable: 0 },
        ],
      },
    },
  });

  // 4. Create Donors
  const donor1 = await prisma.user.upsert({
    where: { email: 'donor1@example.com' },
    update: {},
    create: {
      email: 'donor1@example.com',
      name: 'John Doe',
      passwordHash,
      role: 'DONOR',
      lat: 40.7150,
      lng: -74.0100,
      donorProfile: {
        create: {
          bloodGroup: 'O+',
          lastDonationDate: new Date('2025-01-01'), // > 90 days ago
          isVerified: true,
          reliabilityScore: 9.5,
          isAvailable: true,
        },
      },
    },
  });

  const donor2 = await prisma.user.upsert({
    where: { email: 'donor2@example.com' },
    update: {},
    create: {
      email: 'donor2@example.com',
      name: 'Jane Smith',
      passwordHash,
      role: 'DONOR',
      lat: 40.7500, // further away
      lng: -73.9800,
      donorProfile: {
        create: {
          bloodGroup: 'O+',
          lastDonationDate: new Date('2025-02-15'),
          isVerified: true,
          reliabilityScore: 8.0,
          isAvailable: true,
        },
      },
    },
  });

  console.log({ admin, hospital, bank, donor1, donor2 });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
