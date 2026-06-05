require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true';

module.exports = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || null,
  database: process.env.DB_NAME || 'Melvis_db',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  dialect: 'mysql',
  logging: false,
  // TiDB Serverless (and most cloud MySQL) requires SSL
  ...(isProduction && {
    dialectOptions: {
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      },
    },
  }),
};
