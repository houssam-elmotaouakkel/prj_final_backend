import { create } from 'zustand';

const useCartStore = create((set) => ({
  items: [],
  
  addItem: (product) => set((state) => {
    const existingItem = state.items.find(item => item._id === product._id);
    if (existingItem) {
      return {
        items: state.items.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };
    } else {
      return { items: [...state.items, { ...product, quantity: 1 }] };
    }
  }),

  removeItem: (productId) => set((state) => ({
    items: state.items.filter(item => item._id !== productId),
  })),

  updateQuantity: (productId, quantity) => set((state) => ({
    items: state.items.map(item =>
      item._id === productId
        ? { ...item, quantity: quantity < 1 ? 1 : quantity }
        : item
    ),
  })),

  clearCart: () => set({ items: [] }),

  getTotalAmount: () => {
    const state = useCartStore.getState();
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  },
}));

export default useCartStore;