const { PrismaClient, Role, Gender, BloodGroup, AppointmentStatus, InvoiceStatus, PaymentMethod } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial hospital data...');
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Departments
  const cardiology = await prisma.department.upsert({
    where: { name: 'Cardiology' },
    update: {},
    create: {
      name: 'Cardiology',
      description: 'Department specializing in heart diseases and cardiovascular health',
    },
  });

  const pediatrics = await prisma.department.upsert({
    where: { name: 'Pediatrics' },
    update: {},
    create: {
      name: 'Pediatrics',
      description: 'Medical care for infants, children, and adolescents',
    },
  });

  const neurology = await prisma.department.upsert({
    where: { name: 'Neurology' },
    update: {},
    create: {
      name: 'Neurology',
      description: 'Diagnosis and treatment of nervous system disorders',
    },
  });

  const orthopedics = await prisma.department.upsert({
    where: { name: 'Orthopedics' },
    update: {},
    create: {
      name: 'Orthopedics',
      description: 'Treatment of musculoskeletal system disorders and bone injuries',
    },
  });

  // 2. Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hospital.com' },
    update: {
      password: passwordHash,
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@hospital.com',
      password: passwordHash,
      role: Role.ADMIN,
      staffProfile: {
        create: {
          firstName: 'System',
          lastName: 'Administrator',
          designation: 'Chief Administrator',
          phone: '+8801700000000',
        },
      },
    },
  });

  // 3. Doctor User 1
  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@hospital.com' },
    update: {
      password: passwordHash,
      role: Role.DOCTOR,
    },
    create: {
      email: 'doctor@hospital.com',
      password: passwordHash,
      role: Role.DOCTOR,
    },
  });

  await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {
      consultationFee: 1200.00,
    },
    create: {
      userId: doctorUser.id,
      firstName: 'Dr. John',
      lastName: 'Doe',
      phone: '+8801700000001',
      specialization: 'Cardiologist',
      qualifications: 'MBBS, FCPS (Cardiology), MD',
      experienceYears: 10,
      consultationFee: 1200.00,
      roomNumber: 'Room 302',
      departmentId: cardiology.id,
    },
  });

  // Doctor 2
  const doctor2User = await prisma.user.upsert({
    where: { email: 'sarah.smith@hospital.com' },
    update: {
      password: passwordHash,
      role: Role.DOCTOR,
    },
    create: {
      email: 'sarah.smith@hospital.com',
      password: passwordHash,
      role: Role.DOCTOR,
    },
  });

  await prisma.doctor.upsert({
    where: { userId: doctor2User.id },
    update: {
      consultationFee: 1000.00,
    },
    create: {
      userId: doctor2User.id,
      firstName: 'Dr. Sarah',
      lastName: 'Smith',
      phone: '+8801700000002',
      specialization: 'Pediatric Specialist',
      qualifications: 'MBBS, DCH, MRCPCH',
      experienceYears: 7,
      consultationFee: 1000.00,
      roomNumber: 'Room 205',
      departmentId: pediatrics.id,
    },
  });

  // 4. Receptionist Staff User
  const receptionistUser = await prisma.user.upsert({
    where: { email: 'reception@hospital.com' },
    update: {
      password: passwordHash,
      role: Role.RECEPTIONIST,
    },
    create: {
      email: 'reception@hospital.com',
      password: passwordHash,
      role: Role.RECEPTIONIST,
    },
  });

  await prisma.staff.upsert({
    where: { userId: receptionistUser.id },
    update: {},
    create: {
      userId: receptionistUser.id,
      firstName: 'Nusrat',
      lastName: 'Jahan',
      designation: 'Senior Receptionist',
      phone: '+8801700000003',
    },
  });

  // 5. Patient User & Profile
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@hospital.com' },
    update: {
      password: passwordHash,
      role: Role.PATIENT,
    },
    create: {
      email: 'patient@hospital.com',
      password: passwordHash,
      role: Role.PATIENT,
    },
  });

  let patient = await prisma.patient.findFirst({
    where: { phone: '+8801800000001' },
  });

  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        userId: patientUser.id,
        firstName: 'Rahim',
        lastName: 'Uddin',
        phone: '+8801800000001',
        dateOfBirth: new Date('1990-05-15'),
        gender: Gender.MALE,
        bloodGroup: BloodGroup.O_POSITIVE,
        address: 'Mirpur, Dhaka, Bangladesh',
        emergencyContactName: 'Karim Uddin',
        emergencyPhone: '+8801800000099',
      },
    });
  } else if (!patient.userId) {
    patient = await prisma.patient.update({
      where: { id: patient.id },
      data: { userId: patientUser.id },
    });
  }

  // 6. Wards and Beds
  const generalWard = await prisma.ward.upsert({
    where: { name: 'General Ward A' },
    update: {},
    create: {
      name: 'General Ward A',
      type: 'GENERAL',
      floorNumber: 2,
      totalBeds: 12,
    },
  });

  const icuWard = await prisma.ward.upsert({
    where: { name: 'ICU Unit 1' },
    update: {},
    create: {
      name: 'ICU Unit 1',
      type: 'ICU',
      floorNumber: 3,
      totalBeds: 6,
    },
  });

  await prisma.bed.upsert({
    where: {
      wardId_bedNumber: {
        wardId: generalWard.id,
        bedNumber: 'BED-101',
      },
    },
    update: {},
    create: {
      wardId: generalWard.id,
      bedNumber: 'BED-101',
      dailyCharge: 600.00,
      isOccupied: false,
    },
  });

  await prisma.bed.upsert({
    where: {
      wardId_bedNumber: {
        wardId: generalWard.id,
        bedNumber: 'BED-102',
      },
    },
    update: {},
    create: {
      wardId: generalWard.id,
      bedNumber: 'BED-102',
      dailyCharge: 600.00,
      isOccupied: false,
    },
  });

  // 7. Medicines
  const medicines = [
    { name: 'Napa Extra', genericName: 'Paracetamol + Caffeine 500mg/65mg', category: 'Tablet', manufacturer: 'Beximco', unitPrice: 3.50, stockQuantity: 500 },
    { name: 'Maxpro 20', genericName: 'Esomeprazole 20mg', category: 'Capsule', manufacturer: 'Square', unitPrice: 7.00, stockQuantity: 300 },
    { name: 'Almex 400', genericName: 'Albendazole 400mg', category: 'Chewable Tablet', manufacturer: 'Square', unitPrice: 5.00, stockQuantity: 150 },
    { name: 'Azithrocin 500', genericName: 'Azithromycin 500mg', category: 'Tablet', manufacturer: 'Incepta', unitPrice: 35.00, stockQuantity: 120 },
    { name: 'Ceevit 250', genericName: 'Ascorbic Acid (Vitamin C)', category: 'Chewable Tablet', manufacturer: 'Square', unitPrice: 2.50, stockQuantity: 600 },
  ];

  for (const med of medicines) {
    const existing = await prisma.medicine.findFirst({ where: { name: med.name } });
    if (!existing) {
      await prisma.medicine.create({ data: med });
    }
  }

  // 8. Sample Appointment
  const doctor = await prisma.doctor.findFirst({ where: { userId: doctorUser.id } });
  if (doctor && patient) {
    const existingAppt = await prisma.appointment.findFirst({
      where: { patientId: patient.id, doctorId: doctor.id },
    });

    if (!existingAppt) {
      await prisma.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          appointmentDate: new Date(),
          timeSlot: '10:30 AM',
          serialNumber: 1,
          reason: 'Chest discomfort and routine cardiac checkup',
          status: AppointmentStatus.SCHEDULED,
          notes: 'Patient requested morning slot',
        },
      });
    }
  }

  console.log('✅ Seeding completed successfully!');
  console.log('Sample Logins:');
  console.log('  Admin:        admin@hospital.com       / password123');
  console.log('  Doctor:       doctor@hospital.com      / password123');
  console.log('  Receptionist: reception@hospital.com   / password123');
  console.log('  Patient:      patient@hospital.com     / password123');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
