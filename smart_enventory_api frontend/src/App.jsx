import React, { useState } from "react";
import { ShoppingCart, LogOut } from "lucide-react";
import { StoreProvider, useStore } from "./context/StoreContext";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";

const AppContent = () => {
  const [showRegister, setShowRegister] = useState(false);
  const { user, logout } = useStore();

  if (!user) {
    return (
      <div className="w-full bg-red-500 ">
      {showRegister ? (
        <Register onLoginClick={() => setShowRegister(false)} />
        ) : (
        <Login onRegisterClick={() => setShowRegister(true)} />
        )
      }
      </div>
    );
  }

  return (
    <div className="">
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  E-Commerce Platform
                </h1>
                <p className="text-xs text-gray-500">
                  {user.email} • {user.role}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {user.role === "admin" ? <AdminDashboard /> : <UserDashboard />}
    </div>
  );
};

function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;
