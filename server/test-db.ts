import 'dotenv/config';
import { sequelize } from './src/config/db';
import './src/models/associations';
import { seedDatabase } from './src/config/seed';

async function diagnose() {
  console.log('1. Authenticating...');
  await sequelize.authenticate();
  console.log('2. Authenticated. Synchronizing database (sync)...');
  await sequelize.sync();
  console.log('3. Synchronized. Running seeder...');
  await seedDatabase();
  console.log('4. Seeding completed successfully!');
  await sequelize.close();
  console.log('5. Connection closed.');
}

diagnose().catch(err => {
  console.error('Diagnostics failed:', err);
  process.exit(1);
});
