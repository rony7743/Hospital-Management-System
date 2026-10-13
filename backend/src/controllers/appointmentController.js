const prisma = require('../prisma');

// Book a new appointment
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, reason, patientName, patientPhone } = req.body;

    if (!doctorId || !appointmentDate) {
      return res.status(400).json({
        success: false,
        message: 'Doctor and appointment date are required.',
      });
    }

    let patientId = null;

    // Check if user is authenticated and has patient profile
    if (req.user) {
      const patient = await prisma.patient.findUnique({
        where: { userId: req.user.id },
      });
      if (patient) {
        patientId = patient.id;
      }
    }

    // If not authenticated or patient profile not linked, check or create by phone
    if (!patientId) {
      if (!patientPhone || !patientName) {
        return res.status(400).json({
          success: false,
          message: 'Patient name and phone number are required.',
        });
      }

      let patient = await prisma.patient.findUnique({
        where: { phone: patientPhone.trim() },
      });

      if (!patient) {
        const nameParts = patientName.trim().split(/\s+/);
        patient = await prisma.patient.create({
          data: {
            firstName: nameParts[0] || 'Patient',
            lastName: nameParts.slice(1).join(' ') || 'User',
            phone: patientPhone.trim(),
            dateOfBirth: new Date('2000-01-01'),
            gender: 'OTHER',
          },
        });
      }
      patientId = patient.id;
    }

    // Calculate serial number for the day
    const count = await prisma.appointment.count({
      where: {
        doctorId,
        appointmentDate: {
          gte: new Date(new Date(appointmentDate).setHours(0, 0, 0, 0)),
          lte: new Date(new Date(appointmentDate).setHours(23, 59, 59, 999)),
        },
      },
    });

    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientId,
        appointmentDate: new Date(appointmentDate),
        timeSlot: timeSlot || 'Morning Slot',
        serialNumber: count + 1,
        reason: reason || 'General medical consultation',
        status: 'SCHEDULED',
      },
      include: {
        doctor: {
          include: { department: true },
        },
        patient: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      appointment,
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment',
      error: error.message,
    });
  }
};

// Get appointments list
const getAppointments = async (req, res) => {
  try {
    const where = {};

    // Filter by role if authenticated
    if (req.user) {
      if (req.user.role === 'PATIENT') {
        const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
        if (patient) where.patientId = patient.id;
      } else if (req.user.role === 'DOCTOR') {
        const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
        if (doctor) where.doctorId = doctor.id;
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        doctor: {
          include: { department: true },
        },
        patient: true,
      },
      orderBy: { appointmentDate: 'desc' },
      take: 50,
    });

    res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message,
    });
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
};

