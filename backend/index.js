require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./src/prisma');
const authRoutes = require('./src/routes/authRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const labTestRoutes = require('./src/routes/labTestRoutes');
const wardBedRoutes = require('./src/routes/wardBedRoutes');
const medicineRoutes = require('./src/routes/medicineRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/lab-tests', labTestRoutes);
app.use('/api/wards', wardBedRoutes);
app.use('/api/medicines', medicineRoutes);

// Health route
app.get('/health', async (req, res) => {
  try {
    // Quick test to check if database is accessible
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      message: 'Hospital Management API is running and connected to Database',
    });
  } catch (error) {
    res.status(500).json({
      status: 'DATABASE_ERROR',
      message: 'Failed to connect to the database. Make sure PostgreSQL is running and DATABASE_URL in .env is correct.',
      error: error.message,
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Hospital Management System API',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      doctors: '/api/doctors',
      appointments: '/api/appointments',
      labTests: '/api/lab-tests',
      wards: '/api/wards',
      medicines: '/api/medicines',
    },
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT} (Accessible locally and via LAN)`);
});


