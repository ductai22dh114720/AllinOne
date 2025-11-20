import React from "react";
import AuthForm from "../features/authentication/components/AuthForm";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  return (
    <div className="login-page-container">
      <AuthForm />
    </div>
  );
};

export default LoginPage;
