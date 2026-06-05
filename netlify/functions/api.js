'use strict';
const path = require('path');

// Load .env from backend/ for local netlify dev; no-op in production (env vars from Netlify dashboard)
require('dotenv').config({ path: path.resolve(__dirname, '../../backend/.env') });

const serverless = require('serverless-http');
const app = require('../../backend/src/app');
const { sequelize } = require('../../backend/src/models');

// Cache DB connection across warm invocations
let dbReady = false;

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Prevent Lambda from waiting for the event loop to drain
  context.callbackWaitsForEmptyEventLoop = false;

  // Netlify rewrites /api/products → /.netlify/functions/api/products
  // Fix path so Express sees /api/products, not /.netlify/functions/api/products
  if (event.path && event.path.startsWith('/.netlify/functions/api')) {
    event.path = '/api' + (event.path.slice('/.netlify/functions/api'.length) || '/');
  }

  if (!dbReady) {
    try {
      await sequelize.authenticate();
      dbReady = true;
    } catch (err) {
      console.error('DB connection failed:', err.message);
    }
  }

  return handler(event, context);
};
