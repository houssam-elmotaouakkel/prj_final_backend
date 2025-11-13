// tests/routes/product.routes.test.js
const request = require('supertest');
const app = require('../../src/app');
const Product = require('../../src/models/product.model');
const User = require('../../src/models/user.model');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'un_secret_long_et_difficile_a_deviner';

describe('Product routes', () => {
  let adminToken;
  let userToken;

  beforeAll(async () => {
    // Nettoyer la base
    await Product.deleteMany({});
    await User.deleteMany({});

    // Créer un utilisateur admin
    const admin = await User.create({
      email: 'admin@example.com',
      passwordHash: 'hashed',
      role: 'admin',
    });

    // Créer un utilisateur normal
    const user = await User.create({
      email: 'user@example.com',
      passwordHash: 'hashed',
      role: 'user',
    });

    // Générer des tokens manuellement
    adminToken = jwt.sign({ sub: admin._id.toString(), role: admin.role }, JWT_SECRET);
    userToken = jwt.sign({ sub: user._id.toString(), role: user.role }, JWT_SECRET);
  });

  afterAll(async () => {
    await Product.deleteMany({});
    await User.deleteMany({});
  });

  describe('POST /api/products', () => {
    it('crée un produit avec un admin', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Produit Test',
          sku: 'SKU001',
          price: 19.99,
          category: 'Accessoires',
          stock: 10,
          inStock: true,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('name', 'Produit Test');

      const productInDb = await Product.findOne({ sku: 'SKU001' });
      expect(productInDb).not.toBeNull();
    });

    it('refuse la création sans token admin', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Produit Non Autorisé',
          sku: 'SKU002',
          price: 10,
          category: 'Divers',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.status).toBe('error');
    });
  });

  describe('GET /api/products', () => {
    it('récupère la liste des produits', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    it('récupère un produit par ID', async () => {
      const product = await Product.create({
        name: 'Produit Unique',
        sku: 'SKU003',
        price: 30,
        category: 'Informatique',
      });

      const res = await request(app)
        .get(`/api/products/${product._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('name', 'Produit Unique');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('met à jour un produit avec un admin', async () => {
      const product = await Product.create({
        name: 'Ancien Produit',
        sku: 'SKU004',
        price: 15,
        category: 'Test',
      });

      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Produit Mis à Jour',
          sku: 'SKU004',
          price: 25,
          category: 'Test',
          stock: 5,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('name', 'Produit Mis à Jour');
    });

    it('refuse la mise à jour par un utilisateur non admin', async () => {
      const product = await Product.create({
        name: 'Produit Interdit',
        sku: 'SKU005',
        price: 15,
        category: 'Test',
      });

      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Modification refusée' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('supprime un produit avec un admin', async () => {
      const product = await Product.create({
        name: 'Produit à Supprimer',
        sku: 'SKU006',
        price: 5,
        category: 'Test',
      });

      const res = await request(app)
        .delete(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');

      const deleted = await Product.findById(product._id);
      expect(deleted).toBeNull();
    });

    it('refuse la suppression sans rôle admin', async () => {
      const product = await Product.create({
        name: 'Produit Non Supprimé',
        sku: 'SKU007',
        price: 8,
        category: 'Test',
      });

      const res = await request(app)
        .delete(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
