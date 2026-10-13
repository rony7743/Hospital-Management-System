const prisma = require('../prisma');

// Get all wards with bed availability stats
const getAllWards = async (req, res) => {
  try {
    const wards = await prisma.ward.findMany({
      include: {
        beds: {
          orderBy: { bedNumber: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    const summary = wards.map((ward) => {
      const totalBeds = ward.beds.length;
      const occupiedBeds = ward.beds.filter((b) => b.isOccupied).length;
      const availableBeds = totalBeds - occupiedBeds;

      return {
        ...ward,
        totalBeds,
        occupiedBeds,
        availableBeds,
      };
    });

    res.json({
      success: true,
      count: summary.length,
      wards: summary,
    });
  } catch (error) {
    console.error('Error fetching wards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wards data',
      error: error.message,
    });
  }
};

// Get all beds with optional filter (e.g. only available)
const getAllBeds = async (req, res) => {
  try {
    const { availableOnly, type } = req.query;

    const where = {};
    if (availableOnly === 'true') {
      where.isOccupied = false;
    }
    if (type) {
      where.ward = { type };
    }

    const beds = await prisma.bed.findMany({
      where,
      include: {
        ward: true,
      },
      orderBy: [
        { ward: { name: 'asc' } },
        { bedNumber: 'asc' },
      ],
    });

    res.json({
      success: true,
      count: beds.length,
      beds,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch beds',
      error: error.message,
    });
  }
};

module.exports = {
  getAllWards,
  getAllBeds,
};

