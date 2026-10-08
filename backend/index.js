require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./src/prisma');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

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
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
      },
    },
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT} (Accessible locally and via LAN)`);
});


