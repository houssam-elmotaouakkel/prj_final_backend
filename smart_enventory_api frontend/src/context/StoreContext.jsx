import React, { createContext, useContext, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);

  // Auth
  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.status === 'success') {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.data);
      return true;
    }
    throw new Error(data.message);
  };

  const register = async (email, password, role = 'user') => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await response.json();
    if (data.status === 'success') {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.data);
      return true;
    }
    throw new Error(data.message);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCart([]);
  };

  // Products
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.status === 'success') setProducts(data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const createProduct = async (productData) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    const data = await response.json();
    if (data.status === 'success') {
      await fetchProducts();
      return true;
    }
    throw new Error(data.message);
  };

  const updateProduct = async (id, productData) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    const data = await response.json();
    if (data.status === 'success') {
      await fetchProducts();
      return true;
    }
    throw new Error(data.message);
  };

  const deleteProduct = async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (data.status === 'success') {
      await fetchProducts();
      return true;
    }
    throw new Error(data.message);
  };

  // Orders
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.status === 'success') setOrders(data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const createOrder = async () => {
    const items = cart.map(item => ({
      productId: item._id,
      quantity: item.quantity,
    }));

    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items }),
    });
    const data = await response.json();
    if (data.status === 'success') {
      setCart([]);
      await fetchOrders();
      return true;
    }
    throw new Error(data.message);
  };

  // Cart
  const addToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) {
      setCart(cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item._id === productId ? { ...item, quantity } : item
      ));
    }
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        token,
        products,
        orders,
        cart,
        login,
        register,
        logout,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        fetchOrders,
        createOrder,
        addToCart,
        removeFromCart,
        updateCartQuantity,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};
