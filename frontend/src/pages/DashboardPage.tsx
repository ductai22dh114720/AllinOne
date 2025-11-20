// src/pages/DashboardPage.tsx
import React from "react";
import { useAuth } from "../context/AuthContext";

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>Welcome, {user?.fullName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default DashboardPage;
