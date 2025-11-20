import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation, // Thêm useLocation để debug
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage/HomePage";
import BrowseServicesPage from "./pages/BrowseServicesPage/BrowseServicesPage";

// --- Phần Debug ---
// Một component nhỏ để log sự thay đổi của URL
const LocationLogger = () => {
  const location = useLocation();
  React.useEffect(() => {
    console.log("URL changed to:", location.pathname);
  }, [location]);
  return null; // Component này không render ra gì cả
};
// --- Hết phần Debug ---

// Component ProtectedRoute
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Component PublicRoute
const PublicRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" />;
};

// Component App chính
function App() {
  return (
    // 1. Dùng <Router> ở cấp cao nhất
    <Router>
      {/* Component debug sẽ nằm ngay đây để "nghe" mọi thay đổi */}
      <LocationLogger />

      {/* 2. Dùng <AuthProvider> để bọc lấy toàn bộ logic route */}
      <AuthProvider>
        {/* 3. Đặt <Routes> trực tiếp bên trong */}
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route path="/services" element={<BrowseServicesPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
