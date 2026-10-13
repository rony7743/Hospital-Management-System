const prisma = require('../prisma');

// Diagnostic test catalog with standard pricing
const LAB_CATALOG = [
  { id: '1', testName: 'Complete Blood Count (CBC)', category: 'Pathology', cost: 450, turnaround: '4 Hours' },
  { id: '2', testName: 'Lipid Profile', category: 'Biochemistry', cost: 950, turnaround: '6 Hours' },
  { id: '3', testName: 'Fasting Blood Sugar (FBS)', category: 'Biochemistry', cost: 150, turnaround: '2 Hours' },
  { id: '4', testName: 'Liver Function Test (LFT)', category: 'Biochemistry', cost: 1100, turnaround: '8 Hours' },
  { id: '5', testName: 'Serum Creatinine', category: 'Biochemistry', cost: 350, turnaround: '3 Hours' },
  { id: '6', testName: 'Electrocardiogram (ECG 12-Lead)', category: 'Cardiology', cost: 600, turnaround: 'Instant' },
  { id: '7', testName: 'Echocardiography (2D Color)', category: 'Cardiology', cost: 2500, turnaround: 'Same Day' },
  { id: '8', testName: 'Chest X-Ray (P/A View)', category: 'Radiology', cost: 750, turnaround: '2 Hours' },
  { id: '9', testName: 'Ultrasonography of Whole Abdomen', category: 'Radiology', cost: 1800, turnaround: 'Same Day' },
  { id: '10', testName: 'Urine Routine Examination (R/E)', category: 'Pathology', cost: 200, turnaround: '3 Hours' },
];

const getLabCatalog = (req, res) => {
  res.json({
    success: true,
    catalog: LAB_CATALOG,
  });
};

const getLabTests = async (req, res) => {
  try {
    const where = {};
    if (req.user && req.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
      if (patient) where.patientId = patient.id;
    }

    const labTests = await prisma.labTest.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: { testDate: 'desc' },
      take: 50,
    });

    res.json({
      success: true,
      count: labTests.length,
      labTests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab tests',
      error: error.message,
    });
  }
};

const bookLabTest = async (req, res) => {
  try {
    const { testName, category, cost, patientName, patientPhone } = req.body;

    if (!testName) {
      return res.status(400).json({
        success: false,
        message: 'Test name is required.',
      });
    }

    let patientId = null;
    if (req.user) {
      const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
      if (patient) patientId = patient.id;
    }

    if (!patientId) {
      if (!patientPhone || !patientName) {
        return res.status(400).json({
          success: false,
          message: 'Patient name and phone are required.',
        });
      }

      let patient = await prisma.patient.findUnique({ where: { phone: patientPhone.trim() } });
      if (!patient) {
        const parts = patientName.trim().split(/\s+/);
        patient = await prisma.patient.create({
          data: {
            firstName: parts[0] || 'Patient',
            lastName: parts.slice(1).join(' ') || 'User',
            phone: patientPhone.trim(),
            dateOfBirth: new Date('2000-01-01'),
            gender: 'OTHER',
          },
        });
      }
      patientId = patient.id;
    }

    const test = await prisma.labTest.create({
      data: {
        patientId,
        testName,
        category: category || 'General Diagnostics',
        cost: cost ? parseFloat(cost) : 500.00,
        status: 'PENDING',
      },
      include: {
        patient: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Lab test booked successfully!',
      labTest: test,
    });
  } catch (error) {
    console.error('Error booking lab test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book lab test',
      error: error.message,
    });
  }
};

module.exports = {
  getLabCatalog,
  getLabTests,
  bookLabTest,
};

