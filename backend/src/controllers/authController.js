const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const { JWT_SECRET } = require('../middleware/auth');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register a new user
 * Roles: patient, doctor, staff / receptionist
 */
const register = async (req, res) => {
  try {
    const {
      email,
      password,
      role = 'patient',
      fullName,
      phone,
      gender,
      bloodGroup,
      dateOfBirth,
      specialization,
      departmentId,
      designation,
      address,
    } = req.body;

    // 1. Basic validation
    if (!email || !password || !fullName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, full name, and phone number.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();

    // 2. Check if user email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // 3. Resolve role enum
    let normalizedRole = 'PATIENT';
    const roleUpper = role.toUpperCase();
    if (roleUpper === 'DOCTOR') {
      normalizedRole = 'DOCTOR';
    } else if (roleUpper === 'STAFF' || roleUpper === 'RECEPTIONIST') {
      normalizedRole = 'RECEPTIONIST';
    } else if (roleUpper === 'ADMIN') {
      normalizedRole = 'ADMIN';
    }

    // Check if phone is already used in Patient model if registering as patient
    if (normalizedRole === 'PATIENT') {
      const existingPhone = await prisma.patient.findUnique({
        where: { phone: cleanPhone },
      });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: 'A patient account with this phone number already exists.',
        });
      }
    }

    // 4. Split full name into firstName and lastName
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || (normalizedRole === 'DOCTOR' ? 'Doctor' : 'User');

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create user and related profile inside transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: cleanEmail,
          password: hashedPassword,
          role: normalizedRole,
          isActive: true,
        },
      });

      let profileData = null;

      if (normalizedRole === 'PATIENT') {
        profileData = await tx.patient.create({
          data: {
            userId: user.id,
            firstName,
            lastName,
            phone: cleanPhone,
            gender: gender || 'OTHER',
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('2000-01-01'),
            bloodGroup: bloodGroup || null,
            address: address || null,
          },
        });
      } else if (normalizedRole === 'DOCTOR') {
        // Resolve department
        let targetDeptId = departmentId;
        if (!targetDeptId) {
          const firstDept = await tx.department.findFirst();
          if (firstDept) {
            targetDeptId = firstDept.id;
          } else {
            const newDept = await tx.department.create({
              data: {
                name: 'General Medicine',
                description: 'General Healthcare Department',
              },
            });
            targetDeptId = newDept.id;
          }
        }

        profileData = await tx.doctor.create({
          data: {
            userId: user.id,
            departmentId: targetDeptId,
            firstName,
            lastName,
            phone: cleanPhone,
            specialization: specialization || 'General Medicine',
            qualifications: 'MBBS',
            experienceYears: 1,
            consultationFee: 500.00,
          },
        });
      } else {
        // Staff / Receptionist / Admin
        profileData = await tx.staff.create({
          data: {
            userId: user.id,
            firstName,
            lastName,
            designation: designation || (normalizedRole === 'ADMIN' ? 'Administrator' : 'Staff Member'),
            phone: cleanPhone,
            address: address || null,
          },
        });
      }

      return { user, profile: profileData };
    });

    // 7. Generate JWT token
    const token = jwt.sign(
      {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        fullName: `${firstName} ${lastName}`.trim(),
        phone: cleanPhone,
        profile: result.profile,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration.',
      error: error.message,
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Fetch user by email with associated profiles
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        patientProfile: true,
        doctorProfile: {
          include: { department: true },
        },
        staffProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact hospital administrator.',
      });
    }

    // 2. Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 3. Extract profile details
    let profile = null;
    let fullName = 'User';

    if (user.patientProfile) {
      profile = user.patientProfile;
      fullName = `${user.patientProfile.firstName} ${user.patientProfile.lastName}`.trim();
    } else if (user.doctorProfile) {
      profile = user.doctorProfile;
      fullName = `${user.doctorProfile.firstName} ${user.doctorProfile.lastName}`.trim();
    } else if (user.staffProfile) {
      profile = user.staffProfile;
      fullName = `${user.staffProfile.firstName} ${user.staffProfile.lastName}`.trim();
    }

    // 4. Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName,
        profile,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login.',
      error: error.message,
    });
  }
};

/**
 * Get current authenticated user details
 */
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        patientProfile: true,
        doctorProfile: {
          include: { department: true },
        },
        staffProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    let fullName = 'User';
    let profile = null;
    if (user.patientProfile) {
      profile = user.patientProfile;
      fullName = `${user.patientProfile.firstName} ${user.patientProfile.lastName}`.trim();
    } else if (user.doctorProfile) {
      profile = user.doctorProfile;
      fullName = `${user.doctorProfile.firstName} ${user.doctorProfile.lastName}`.trim();
    } else if (user.staffProfile) {
      profile = user.staffProfile;
      fullName = `${user.staffProfile.firstName} ${user.staffProfile.lastName}`.trim();
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName,
        createdAt: user.createdAt,
        profile,
      },
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile.',
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};

