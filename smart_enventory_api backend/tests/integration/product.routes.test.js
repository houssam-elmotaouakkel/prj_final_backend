const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/user.model');
const Product = require('../../src/models/product.model');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'un_secret_long_et_difficile_a_deviner';

function generateToken(user) {
  return jwt.sign({ sub: user._id, role: user.role }, JWT_SECRET);
}

describe('Product routes', () => {
  let adminToken, userToken;

  beforeEach(async () => {
    const admin = await User.create({
      email: 'admin@example.com',
      passwordHash: 'hashedpass',
      role: 'admin',
    });
    const user = await User.create({
      email: 'user@example.com',
      passwordHash: 'hashedpass',
      role: 'user',
    });

    adminToken = generateToken(admin);
    userToken = generateToken(user);
  });

  describe('GET /api/products', () => {
    it('returns product list', async () => {
      await Product.create({ name: 'P1', sku: 'S1', price: 10, category: 'cat1', stock: 5, inStock: true });

      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/products', () => {
    it('allows admin to create a product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Product', sku: 'SKU123', price: 50, category: 'cat', stock: 10 });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
    });

    it('forbids normal user to create a product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Forbidden', sku: 'SKU999', price: 20, category: 'test' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('allows admin to delete a product', async () => {
      const product = await Product.create({ name: 'Del', sku: 'DEL123', price: 30, category: 'cat' });

      const res = await request(app)
        .delete(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/supprimé/i);
    });
  });
});
