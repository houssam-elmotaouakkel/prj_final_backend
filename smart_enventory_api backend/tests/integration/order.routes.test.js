const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/user.model');
const Product = require('../../src/models/product.model');
const Order = require('../../src/models/order.model');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'un_secret_long_et_difficile_a_deviner';

function generateToken(user) {
  return jwt.sign({ sub: user._id, role: user.role }, JWT_SECRET);
}

describe('Order routes', () => {
  let user, userToken, product;

  beforeEach(async () => {
    user = await User.create({
      email: 'orderuser@example.com',
      passwordHash: 'hashed',
      role: 'user',
    });
    product = await Product.create({
      name: 'ProductOrder',
      sku: 'ORD001',
      price: 100,
      category: 'orders',
      stock: 10,
      inStock: true,
    });
    userToken = generateToken(user);
  });

  describe('GET /api/orders', () => {
    it('returns orders list', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
    });
  });

  describe('POST /api/orders', () => {
    it('creates an order for authenticated user', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ productId: product._id, quantity: 2 }],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.totalAmount).toBe(200);
    });

    it('refuses order creation if not logged in', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          items: [{ productId: product._id, quantity: 1 }],
        });

      expect(res.statusCode).toBe(401);
    });
  });
});
