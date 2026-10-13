// LifeLink – Smart Blood Donor Network Seed Script
// Explicitly labeled [DEMO] records for ethical and safety compliance

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding LifeLink Database with [DEMO] records ---');

  // Clear existing demo records
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.donationRecord.deleteMany();
  await prisma.contactRequest.deleteMany();
  await prisma.match.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.bloodRequest.deleteMany();
  await prisma.donorProfile.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.bloodBank.deleteMany();
  await prisma.user.deleteMany();

  const standardPasswordHash = await bcrypt.hash('DemoDonor@123', 10);
  const adminPasswordHash = await bcrypt.hash('DemoAdmin@123', 10);
  const patientPasswordHash = await bcrypt.hash('DemoPatient@123', 10);
  const hospitalPasswordHash = await bcrypt.hash('DemoHospital@123', 10);

  // 1. Create Demo Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@lifelink.demo',
      passwordHash: adminPasswordHash,
      fullName: '[DEMO] Dr. Rajesh Rao (Admin)',
      phone: '+91-9800000001',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  // 2. Create Demo Patient / Requester
  const patientUser = await prisma.user.create({
    data: {
      email: 'patient@lifelink.demo',
      passwordHash: patientPasswordHash,
      fullName: '[DEMO] Suresh Kumar (Requester)',
      phone: '+91-9800000002',
      role: 'PATIENT',
      isVerified: true,
    },
  });

  // 3. Create Demo Hospital Partner User
  const hospitalUser = await prisma.user.create({
    data: {
      email: 'hospital@lifelink.demo',
      passwordHash: hospitalPasswordHash,
      fullName: '[DEMO] Manipal Hospital Partner Desk',
      phone: '+91-9800000003',
      role: 'HOSPITAL',
      isVerified: true,
    },
  });

  // 4. Create Demo Donors across all 8 blood groups
  const demoDonorsList = [
    {
      email: 'donor.o@lifelink.demo',
      name: '[DEMO] Rakesh Sharma (Universal Donor O-)',
      bloodGroup: 'O-',
      city: 'Bengaluru',
      locality: 'Indiranagar',
      pincode: '560038',
      lat: 12.9784,
      lng: 77.6408,
      age: 28,
      donations: 6,
      reliability: 1.0,
      available: true,
      confirmedHoursAgo: 2,
    },
    {
      email: 'donor.a@lifelink.demo',
      name: '[DEMO] Ananya Iyer (A+)',
      bloodGroup: 'A+',
      city: 'Bengaluru',
      locality: 'Koramangala',
      pincode: '560034',
      lat: 12.9352,
      lng: 77.6245,
      age: 24,
      donations: 3,
      reliability: 0.95,
      available: true,
      confirmedHoursAgo: 4,
    },
    {
      email: 'donor.b@lifelink.demo',
      name: '[DEMO] Vikram Patil (B+)',
      bloodGroup: 'B+',
      city: 'Bengaluru',
      locality: 'Jayanagar',
      pincode: '560041',
      lat: 12.9308,
      lng: 77.5838,
      age: 31,
      donations: 8,
      reliability: 1.0,
      available: true,
      confirmedHoursAgo: 1,
    },
    {
      email: 'donor.ab_pos@lifelink.demo',
      name: '[DEMO] Priya Nair (AB+ Universal Recipient)',
      bloodGroup: 'AB+',
      city: 'Bengaluru',
      locality: 'Whitefield',
      pincode: '560066',
      lat: 12.9698,
      lng: 77.7499,
      age: 26,
      donations: 2,
      reliability: 0.9,
      available: true,
      confirmedHoursAgo: 12,
    },
    {
      email: 'donor.ab_neg@lifelink.demo',
      name: '[DEMO] Karthik Gowda (AB- Rare)',
      bloodGroup: 'AB-',
      city: 'Bengaluru',
      locality: 'Malleshwaram',
      pincode: '560003',
      lat: 13.0031,
      lng: 77.5643,
      age: 33,
      donations: 5,
      reliability: 0.85,
      available: true,
      confirmedHoursAgo: 24,
    },
    {
      email: 'donor.o_pos@lifelink.demo',
      name: '[DEMO] Deepa Hegde (O+)',
      bloodGroup: 'O+',
      city: 'Bengaluru',
      locality: 'HSR Layout',
      pincode: '560102',
      lat: 12.9121,
      lng: 77.6446,
      age: 29,
      donations: 4,
      reliability: 1.0,
      available: true,
      confirmedHoursAgo: 6,
    },
    {
      email: 'donor.a_neg@lifelink.demo',
      name: '[DEMO] Rohan Kulkarni (A-)',
      bloodGroup: 'A-',
      city: 'Mysuru',
      locality: 'Jayalakshmipuram',
      pincode: '570012',
      lat: 12.3218,
      lng: 76.6293,
      age: 27,
      donations: 2,
      reliability: 0.8,
      available: true,
      confirmedHoursAgo: 48,
    },
    {
      email: 'donor.b_neg@lifelink.demo',
      name: '[DEMO] Sneha Deshmukh (B-)',
      bloodGroup: 'B-',
      city: 'Hubballi',
      locality: 'Vidyanagar',
      pincode: '580021',
      lat: 15.3647,
      lng: 75.124,
      age: 30,
      donations: 3,
      reliability: 0.9,
      available: true,
      confirmedHoursAgo: 18,
    },
    {
      email: 'donor.mangalore@lifelink.demo',
      name: '[DEMO] Abhishek Shetty (O+)',
      bloodGroup: 'O+',
      city: 'Mangaluru',
      locality: 'Kadri',
      pincode: '575002',
      lat: 12.8797,
      lng: 74.856,
      age: 35,
      donations: 7,
      reliability: 1.0,
      available: true,
      confirmedHoursAgo: 8,
    },
    {
      email: 'donor.recovering@lifelink.demo',
      name: '[DEMO] Meera Sen (B+ Resting)',
      bloodGroup: 'B+',
      city: 'Bengaluru',
      locality: 'Hebbal',
      pincode: '560024',
      lat: 13.0358,
      lng: 77.597,
      age: 22,
      donations: 1,
      reliability: 0.8,
      available: false, // temporarily in recovery
      confirmedHoursAgo: 72,
    },
  ];

  const createdDonors: any[] = [];

  for (const d of demoDonorsList) {
    const user = await prisma.user.create({
      data: {
        email: d.email,
        passwordHash: standardPasswordHash,
        fullName: d.name,
        phone: '+91-98000000' + Math.floor(10 + Math.random() * 89),
        role: 'DONOR',
        isVerified: true,
      },
    });

    const confirmedAt = new Date(Date.now() - d.confirmedHoursAgo * 60 * 60 * 1000);
    const lastDonationDate = new Date(Date.now() - 110 * 24 * 60 * 60 * 1000); // 110 days ago (eligible)

    const profile = await prisma.donorProfile.create({
      data: {
        userId: user.id,
        bloodGroup: d.bloodGroup,
        city: d.city,
        locality: d.locality,
        pincode: d.pincode,
        latitude: d.lat,
        longitude: d.lng,
        age: d.age,
        lastDonationDate: d.available ? lastDonationDate : new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        isAvailable: d.available,
        lastConfirmedAt: confirmedAt,
        preferredContact: 'IN_APP',
        consentGiven: true,
        isPublic: true,
        totalDonations: d.donations,
        reliabilityScore: d.reliability,
      },
    });

    // Add a past donation record
    const nextEligible = new Date(lastDonationDate.getTime() + 90 * 24 * 60 * 60 * 1000);
    await prisma.donationRecord.create({
      data: {
        donorId: profile.id,
        donationDate: lastDonationDate,
        donationType: 'WHOLE_BLOOD',
        units: 1,
        hospitalName: '[DEMO] Victoria Hospital Blood Bank',
        verified: true,
        nextEligibleDate: nextEligible,
      },
    });

    createdDonors.push({ user, profile });
  }

  // 5. Seed Emergency Blood Requests
  const emergencyReq1 = await prisma.bloodRequest.create({
    data: {
      requesterId: patientUser.id,
      patientName: '[DEMO] Master Arjun (Post-Op Trauma)',
      bloodGroup: 'O-',
      unitsRequired: 2,
      hospitalName: '[DEMO] Victoria Hospital & Trauma Care',
      city: 'Bengaluru',
      locality: 'Fort Area, City Market',
      pincode: '560002',
      latitude: 12.9634,
      longitude: 77.5755,
      requiredBy: new Date(Date.now() + 6 * 60 * 60 * 1000), // In 6 hours
      urgency: 'CRITICAL',
      contactPreference: 'IN_APP',
      note: 'Emergency laparotomy scheduled. Compatible O- or O- cross-matched units required immediately.',
      status: 'OPEN',
    },
  });

  const emergencyReq2 = await prisma.bloodRequest.create({
    data: {
      requesterId: patientUser.id,
      patientName: '[DEMO] Mrs. Sunita Devi (Cardiac Surgery)',
      bloodGroup: 'A+',
      unitsRequired: 3,
      hospitalName: '[DEMO] Manipal Hospital Old Airport Rd',
      city: 'Bengaluru',
      locality: 'HAL Airport Road',
      pincode: '560017',
      latitude: 12.9585,
      longitude: 77.6483,
      requiredBy: new Date(Date.now() + 18 * 60 * 60 * 1000), // In 18 hours
      urgency: 'HIGH',
      contactPreference: 'IN_APP',
      note: 'Scheduled bypass surgery. Requires 3 units of A+ or compatible group.',
      status: 'OPEN',
    },
  });

  const emergencyReq3 = await prisma.bloodRequest.create({
    data: {
      requesterId: patientUser.id,
      patientName: '[DEMO] Mr. Ramesh Chand (Dengue Platelets)',
      bloodGroup: 'B+',
      unitsRequired: 2,
      hospitalName: '[DEMO] KIMS Hospital & Medical College',
      city: 'Bengaluru',
      locality: 'VV Puram',
      pincode: '560004',
      latitude: 12.9554,
      longitude: 77.5739,
      requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000), // In 24 hours
      urgency: 'MEDIUM',
      contactPreference: 'IN_APP',
      note: 'Platelet count dropping; Single Donor Platelets (SDP) or B+ whole blood welcome.',
      status: 'OPEN',
    },
  });

  // 6. Seed Verified Hospitals
  await prisma.hospital.createMany({
    data: [
      {
        name: '[DEMO] Victoria Hospital Emergency & Trauma Care',
        address: 'Fort Road, Near City Market',
        city: 'Bengaluru',
        pincode: '560002',
        latitude: 12.9634,
        longitude: 77.5755,
        phone: '+91-80-26701150',
        email: 'victoria_emergency@lifelink.demo',
        emergencyHelpline: '108 / 080-26701150',
        isVerified: true,
        bloodStockJson: JSON.stringify({
          'A+': 14,
          'A-': 4,
          'B+': 18,
          'B-': 3,
          'AB+': 8,
          'AB-': 2,
          'O+': 22,
          'O-': 5,
        }),
      },
      {
        name: '[DEMO] Manipal Hospital Bengaluru',
        address: '98, HAL Old Airport Rd, Kodihalli',
        city: 'Bengaluru',
        pincode: '560017',
        latitude: 12.9585,
        longitude: 77.6483,
        phone: '+91-80-25024444',
        email: 'bloodbank.manipal@lifelink.demo',
        emergencyHelpline: '080-22221111',
        isVerified: true,
        bloodStockJson: JSON.stringify({
          'A+': 20,
          'A-': 6,
          'B+': 25,
          'B-': 5,
          'AB+': 12,
          'AB-': 3,
          'O+': 30,
          'O-': 8,
        }),
      },
      {
        name: '[DEMO] KIMS Medical College Hospital',
        address: 'K.R. Road, V.V. Puram',
        city: 'Bengaluru',
        pincode: '560004',
        latitude: 12.9554,
        longitude: 77.5739,
        phone: '+91-80-26613225',
        email: 'kims.blood@lifelink.demo',
        emergencyHelpline: '080-26613225',
        isVerified: true,
        bloodStockJson: JSON.stringify({
          'A+': 12,
          'A-': 2,
          'B+': 15,
          'B-': 2,
          'AB+': 5,
          'AB-': 1,
          'O+': 18,
          'O-': 3,
        }),
      },
      {
        name: '[DEMO] K.R. Hospital & Mysore Medical College',
        address: 'Irwin Road, Mysuru',
        city: 'Mysuru',
        pincode: '570001',
        latitude: 12.3155,
        longitude: 76.6508,
        phone: '+91-821-2520512',
        email: 'krhospital.mysuru@lifelink.demo',
        emergencyHelpline: '0821-2520512',
        isVerified: true,
        bloodStockJson: JSON.stringify({
          'A+': 10,
          'A-': 3,
          'B+': 12,
          'B-': 2,
          'AB+': 4,
          'AB-': 1,
          'O+': 16,
          'O-': 4,
        }),
      },
    ],
  });

  // 7. Seed Verified Blood Banks
  await prisma.bloodBank.createMany({
    data: [
      {
        name: '[DEMO] Red Cross Society Central Blood Bank',
        address: 'No. 26, Red Cross Bhavan, 1st Main Road, Race Course Rd',
        city: 'Bengaluru',
        pincode: '560001',
        latitude: 12.9833,
        longitude: 77.5833,
        phone: '+91-80-22264205',
        email: 'redcross.bengaluru@lifelink.demo',
        operatingHours: '24 Hours / 365 Days',
        isVerified: true,
        bloodStockJson: JSON.stringify({
          'A+': 35,
          'A-': 8,
          'B+': 42,
          'B-': 10,
          'AB+': 16,
          'AB-': 6,
          'O+': 50,
          'O-': 15,
        }),
      },
      {
        name: '[DEMO] Lions Blood Bank & Component Separation Unit',
        address: '15/1, Queens Road, Vasanth Nagar',
        city: 'Bengaluru',
        pincode: '560052',
        latitude: 12.9882,
        longitude: 77.595,
        phone: '+91-80-22268484',
        email: 'lions.bloodbank@lifelink.demo',
        operatingHours: '24 Hours',
        isVerified: true,
        bloodStockJson: JSON.stringify({
          'A+': 28,
          'A-': 7,
          'B+': 32,
          'B-': 8,
          'AB+': 14,
          'AB-': 4,
          'O+': 40,
          'O-': 12,
        }),
      },
      {
        name: '[DEMO] Rotary Bangalore Blood Bank',
        address: 'TTD Kalyana Mantapam Road, Vyalikaval',
        city: 'Bengaluru',
        pincode: '560003',
        latitude: 13.0039,
        longitude: 77.5758,
        phone: '+91-80-23467654',
        email: 'rotary.blood@lifelink.demo',
        operatingHours: '08:00 AM - 10:00 PM',
        isVerified: true,
        bloodStockJson: JSON.stringify({
          'A+': 18,
          'A-': 4,
          'B+': 22,
          'B-': 5,
          'AB+': 9,
          'AB-': 2,
          'O+': 28,
          'O-': 7,
        }),
      },
    ],
  });

  // 8. Create a sample Contact Request and In-App Notifications
  const firstDonor = createdDonors[0]; // Rakesh Sharma O-
  const contactSample = await prisma.contactRequest.create({
    data: {
      requestId: emergencyReq1.id,
      donorId: firstDonor.profile.id,
      requesterId: patientUser.id,
      message: 'Urgent surgery scheduled at Victoria Hospital. Can you please confirm availability for O- units?',
      status: 'PENDING',
    },
  });

  await prisma.notification.create({
    data: {
      userId: firstDonor.user.id,
      title: 'Urgent Match: CRITICAL O- Blood Needed',
      message: 'A patient at Victoria Hospital urgently requires 2 units of O- blood. Your priority ranking score is 96.5/100.',
      type: 'EMERGENCY',
      dataJson: JSON.stringify({
        requestId: emergencyReq1.id,
        contactRequestId: contactSample.id,
      }),
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: patientUser.id,
      title: '3 Compatible Donors Notified',
      message: 'Your emergency request for Master Arjun has been broadcasted to top matching donors in Bengaluru.',
      type: 'STATUS_UPDATE',
      dataJson: JSON.stringify({ requestId: emergencyReq1.id }),
      isRead: true,
    },
  });

  // 9. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_INITIALIZED',
      ipAddress: '127.0.0.1',
      detailsJson: JSON.stringify({ message: 'LifeLink demo seed executed successfully' }),
    },
  });

  console.log('--- LifeLink Demo Seed Completed Successfully! ---');
  console.log('Demo Credentials:');
  console.log('  Admin:     admin@lifelink.demo    / DemoAdmin@123');
  console.log('  Donor (O-): donor.o@lifelink.demo  / DemoDonor@123');
  console.log('  Donor (A+): donor.a@lifelink.demo  / DemoDonor@123');
  console.log('  Patient:   patient@lifelink.demo  / DemoPatient@123');
  console.log('  Hospital:  hospital@lifelink.demo / DemoHospital@123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
