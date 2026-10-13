const prisma = require('../prisma');

// Get all doctors with department info
const getAllDoctors = async (req, res) => {
  try {
    const { departmentId, search } = req.query;

    const where = {
      isAvailable: true,
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } },
      ];
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        department: true,
        schedules: {
          where: { isActive: true },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    res.json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: error.message,
    });
  }
};

// Get single doctor details by ID
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        department: true,
        schedules: {
          where: { isActive: true },
        },
      },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.json({
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor details',
      error: error.message,
    });
  }
};

// Get all departments
const getAllDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { doctors: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments',
      error: error.message,
    });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getAllDepartments,
};

