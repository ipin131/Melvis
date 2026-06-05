require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { sequelize } = require('../models');
const { seed: seedProducts } = require('./productSeeder');
const { seed: seedStores } = require('./storeSeeder');

async function seedAll() {
  await sequelize.authenticate();
  console.log('DB connected');
  await sequelize.sync({ alter: true });
  console.log('Models synced');
  await seedProducts();
  await seedStores();
  console.log('All seeds completed successfully');
  process.exit(0);
}

seedAll().catch((err) => { console.error('Seeding failed:', err); process.exit(1); });
