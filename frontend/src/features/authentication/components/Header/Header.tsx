import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Link, useNavigate } from "react-router-dom"; // 1. Thêm useNavigate
import { useAuth } from "../../../../context/AuthContext"; // 2. Import useAuth
import "./Header.css"; // Import CSS cho Header
import logo from "../../../../assets/logo.png"; // Import logo

const Header: React.FC = () => {
  const headerRef = useRef<HTMLElement>(null);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  // Animation cho header khi tải trang
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -100, opacity: 0 }, // Bắt đầu từ vị trí ẩn phía trên
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          delay: 0.2, // Chờ một chút trước khi header xuất hiện
        }
      );
    }
  }, []);

  // Hàm xử lý khi nhấn nút Logout
  const handleLogout = () => {
    logout();
    // Sau khi logout, chuyển hướng người dùng về trang chủ
    navigate("/");
  };

  return (
    <header className="site-header" ref={headerRef}>
      <nav className="header-nav">
        <Link to="/" className="logo-link">
          <img src={logo} alt="Brand Logo" className="logo-img" />
        </Link>
        <ul className="nav-links">
          <li>
            <a href="/services">Find Services</a>
          </li>
          <li>
            <a href="#become-pro">Become a Pro</a>
          </li>
          <li>
            <a href="#about-us">About Us</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
        </ul>

        {/* 4. LOGIC HIỂN THỊ CÓ ĐIỀU KIỆN */}
        <div className="header-actions">
          {isAuthenticated ? (
            // Nếu ĐÃ đăng nhập
            <>
              <span className="welcome-message">
                Welcome, {user?.fullName}!
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-outline logout-btn"
              >
                Log Out
              </button>
            </>
          ) : (
            // Nếu CHƯA đăng nhập
            <>
              <Link to="/login" className="btn btn-outline login-btn">
                Log In
              </Link>
              <Link
                to="/login?mode=register"
                className="btn btn-secondary register-btn"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
export default Header;
