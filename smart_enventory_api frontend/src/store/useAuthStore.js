import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null, // { id, email, role }
      isLoggedIn: () => !!get().token,
      isAdmin: () => get().user?.role === 'admin',

      login: ({ token, user }) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      
      // Update user role (Admin functionality)
      updateUserRole: (userId, newRole) => {
        if (get().user?.id === userId) {
          set((state) => ({
            user: { ...state.user, role: newRole }
          }));
        }
      },
    }),
    {
      name: 'auth-storage', // name of the item in storage
      getStorage: () => localStorage, // (optional) by default, it uses localStorage
    }
  )
);

export default useAuthStore;