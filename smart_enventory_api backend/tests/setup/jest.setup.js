// trests/setup/jest.setup.js
require('dotenv').config({ path: '.env.development' });
const db = require('./test-db');

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.closeDatabase();
});

afterEach(async () => {
  await db.clearDatabase();
});

