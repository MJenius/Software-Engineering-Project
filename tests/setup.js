// tests/setup.js
const db = require('../database');

beforeAll(async () => {
    await db.initialize();
});

afterAll(async () => {
    await db.close();
});
