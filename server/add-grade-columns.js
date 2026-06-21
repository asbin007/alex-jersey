const { sequelize } = require('./dist/config/db');

async function addGradeColumns() {
  try {
    // Add grade column to Products table
    await sequelize.query(`
      ALTER TABLE "Products"
      ADD COLUMN "grade" VARCHAR(1) CHECK (grade IN ('A', 'B')) NULL,
      ADD COLUMN "gradeDescription" TEXT NULL;
    `);

    console.log('Added grade and gradeDescription columns to Products table');

    // Add enum type for grade
    await sequelize.query(`
      CREATE TYPE grade_enum AS ENUM ('A', 'B');
    `);

    // Convert grade column to use the enum type
    await sequelize.query(`
      ALTER TABLE "Products"
      ALTER COLUMN "grade" TYPE grade_enum
      USING grade::grade_enum;
    `);

    console.log('Successfully added grade columns with enum type');

  } catch (error) {
    console.error('Error adding grade columns:', error);
  } finally {
    await sequelize.close();
  }
}

addGradeColumns();