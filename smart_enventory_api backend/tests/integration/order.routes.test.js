// tests/routes/order.routes.test.js
const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Order = require('../../src/models/order.model');
const Product = require('../../src/models/product.model');
const User = require('../../src/models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'un_secret_long_et_difficile_a_deviner';

describe('Order routes', () => {
  let userToken;
  let adminToken;
  let user;
  let admin;
  let product;

  beforeAll(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    // Créer un utilisateur "user"
    user = await User.create({
      email: 'client@example.com',
      passwordHash: 'hashed',
      role: 'user',
    });

    // Créer un utilisateur "admin"
    admin = await User.create({
      email: 'admin@example.com',
      passwordHash: 'hashed',
      role: 'admin',
    });

    // Générer des tokens JWT
    userToken = jwt.sign({ sub: user._id.toString(), role: user.role }, JWT_SECRET);
    adminToken = jwt.sign({ sub: admin._id.toString(), role: admin.role }, JWT_SECRET);

    // Créer un produit pour les commandes
    product = await Product.create({
      name: 'Produit Commande',
      sku: 'ORD001',
      price: 50,
      category: 'Accessoires',
      stock: 100,
      inStock: true,
    });
  });

  afterAll(async () => {
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/orders', () => {
    it('crée une commande valide (utilisateur authentifié)', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [
            {
              product: product._id,
              quantity: 2,
              unitPrice: 50,
            },
          ],
          totalAmount: 100,
          status: 'pending',
          user: user._id,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('totalAmount', 100);

      const orderInDb = await Order.findOne({ user: user._id });
      expect(orderInDb).not.toBeNull();
      expect(orderInDb.items.length).toBe(1);
    });

    it('refuse la création sans token', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          items: [
            {
              product: product._id,
              quantity: 1,
              unitPrice: 50,
            },
          ],
          totalAmount: 50,
          user: user._id,
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
    });

    it('refuse une commande invalide (pas d’items)', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [],
          totalAmount: 0,
          user: user._id,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });

  describe('GET /api/orders', () => {
    it('récupère toutes les commandes', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('récupère une commande par ID', async () => {
      const order = await Order.create({
        items: [
          {
            product: product._id,
            quantity: 1,
            unitPrice: 50,
          },
        ],
        totalAmount: 50,
        user: user._id,
      });

      const res = await request(app).get(`/api/orders/${order._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('totalAmount', 50);
    });

    it('retourne 404 pour une commande inexistante', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/orders/${fakeId}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe('error');
    });
  });
});
