const prisma = require('../prisma');

// Get all medicines with optional search
const getAllMedicines = async (req, res) => {
  try {
    const { search, category } = req.query;

    const where = {};

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
      ];
    }

    const medicines = await prisma.medicine.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      count: medicines.length,
      medicines,
    });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medicines',
      error: error.message,
    });
  }
};

// Get medicine categories
const getMedicineCategories = async (req, res) => {
  try {
    const categories = await prisma.medicine.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    res.json({
      success: true,
      categories: categories.map((c) => c.category),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
};

module.exports = {
  getAllMedicines,
  getMedicineCategories,
};

