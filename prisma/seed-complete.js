const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Ensure Blood Bank has all 8 blood groups
  const bank = await prisma.user.upsert({
    where: { email: 'centralbank@bloodsys.com' },
    update: {},
    create: {
      email: 'centralbank@bloodsys.com',
      name: 'Central Metro Blood Bank',
      passwordHash,
      role: 'BLOOD_BANK',
      lat: 40.7138,
      lng: -74.0070,
    },
  });

  const bloodGroups = [
    { bloodGroup: 'O+', unitsAvailable: 14 },
    { bloodGroup: 'O-', unitsAvailable: 6 },
    { bloodGroup: 'A+', unitsAvailable: 10 },
    { bloodGroup: 'A-', unitsAvailable: 4 },
    { bloodGroup: 'B+', unitsAvailable: 8 },
    { bloodGroup: 'B-', unitsAvailable: 3 },
    { bloodGroup: 'AB+', unitsAvailable: 5 },
    { bloodGroup: 'AB-', unitsAvailable: 2 },
  ];

  for (const bg of bloodGroups) {
    const existing = await prisma.bloodBankInventory.findFirst({
      where: { bankId: bank.id, bloodGroup: bg.bloodGroup },
    });
    if (existing) {
      await prisma.bloodBankInventory.update({
        where: { id: existing.id },
        data: { unitsAvailable: bg.unitsAvailable },
      });
    } else {
      await prisma.bloodBankInventory.create({
        data: {
          bankId: bank.id,
          bloodGroup: bg.bloodGroup,
          unitsAvailable: bg.unitsAvailable,
        },
      });
    }
  }

  // 2. Add diverse verified donors across blood groups
  const donors = [
    {
      email: 'alex.rivera@example.com',
      name: 'Alex Rivera (Universal Donor)',
      bloodGroup: 'O-',
      lat: 40.7180,
      lng: -74.0030,
      reliabilityScore: 9.9,
      isVerified: true,
      isAvailable: true,
    },
    {
      email: 'sarah.connor@example.com',
      name: 'Sarah Connor',
      bloodGroup: 'A+',
      lat: 40.7250,
      lng: -74.0090,
      reliabilityScore: 9.2,
      isVerified: true,
      isAvailable: true,
    },
    {
      email: 'marcus.vance@example.com',
      name: 'Marcus Vance',
      bloodGroup: 'B-',
      lat: 40.7110,
      lng: -74.0150,
      reliabilityScore: 8.8,
      isVerified: true,
      isAvailable: true,
    },
    {
      email: 'elena.rostova@example.com',
      name: 'Dr. Elena Rostova',
      bloodGroup: 'AB+',
      lat: 40.7300,
      lng: -73.9950,
      reliabilityScore: 9.7,
      isVerified: true,
      isAvailable: true,
    },
    {
      email: 'david.kim@example.com',
      name: 'David Kim',
      bloodGroup: 'B+',
      lat: 40.7090,
      lng: -74.0010,
      reliabilityScore: 8.5,
      isVerified: true,
      isAvailable: true,
    },
  ];

  for (const d of donors) {
    await prisma.user.upsert({
      where: { email: d.email },
      update: {
        name: d.name,
        lat: d.lat,
        lng: d.lng,
        donorProfile: {
          upsert: {
            create: {
              bloodGroup: d.bloodGroup,
              reliabilityScore: d.reliabilityScore,
              isVerified: d.isVerified,
              isAvailable: d.isAvailable,
              lastDonationDate: new Date('2025-01-10'),
            },
            update: {
              bloodGroup: d.bloodGroup,
              reliabilityScore: d.reliabilityScore,
              isVerified: d.isVerified,
              isAvailable: d.isAvailable,
            },
          },
        },
      },
      create: {
        email: d.email,
        name: d.name,
        passwordHash,
        role: 'DONOR',
        lat: d.lat,
        lng: d.lng,
        donorProfile: {
          create: {
            bloodGroup: d.bloodGroup,
            reliabilityScore: d.reliabilityScore,
            isVerified: d.isVerified,
            isAvailable: d.isAvailable,
            lastDonationDate: new Date('2025-01-10'),
          },
        },
      },
    });
  }

  // 3. Create a fresh PENDING request so the user can test the AI agent right away!
  const hospital = await prisma.user.findFirst({ where: { role: 'HOSPITAL' } });
  if (hospital) {
    await prisma.emergencyRequest.create({
      data: {
        hospitalId: hospital.id,
        bloodGroup: 'O-',
        unitsRequired: 2,
        urgency: 'CRITICAL',
        status: 'PENDING',
        lat: 40.7128,
        lng: -74.0060,
      },
    });
  }

  console.log('Database enrichment complete.');
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
