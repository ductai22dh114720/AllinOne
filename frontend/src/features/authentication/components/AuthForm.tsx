import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useAuth } from "../../../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import * as authService from "../services/authService";

// Import các icon (giả sử bạn đã cài đặt FontAwesome)
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faGoogle,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faLock } from "@fortawesome/free-solid-svg-icons";

import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth as firebaseAuth } from "../../../lib/firebase";

// Import CSS cho component này
import "./AuthForm.css";

const AuthForm: React.FC = () => {
  // Lấy hàm login từ AuthContext
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  // State để quản lý chế độ đăng ký hay đăng nhập
  const isRegisterInitial = searchParams.get("mode") === "register";
  const [isRegisterMode, setIsRegisterMode] = useState(isRegisterInitial);

  // State cho các trường input
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State cho trạng thái loading và lỗi
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useRef để tham chiếu đến card element cho animation
  const cardRef = useRef<HTMLDivElement>(null);

  // useEffect để chạy animation GSAP một lần khi component được render
  useEffect(() => {
    if (cardRef.current) {
      // Animation cho card hiện lên từ dưới
      gsap.to(cardRef.current, {
        duration: 0.8,
        opacity: 1,
        y: 0, // Bắt đầu từ vị trí thấp hơn 30px
        ease: "power2.out",
      });
    }
  }, []);

  const handleSocialLogin = async (
    provider: GoogleAuthProvider | FacebookAuthProvider | TwitterAuthProvider
  ) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Mở popup đăng nhập của Firebase
      const result = await signInWithPopup(firebaseAuth, provider);

      // 2. Lấy Firebase ID Token từ kết quả
      const idToken = await result.user.getIdToken();

      // 3. Gửi token này đến backend của bạn để xác thực
      // (Giả sử bạn có một service và endpoint mới cho social login)
      const response = await authService.socialSignIn(idToken);

      // 4. Backend trả về token của riêng bạn, tiến hành đăng nhập
      const { token, ...userData } = response;
      login(userData, token);
    } catch (err: any) {
      // Xử lý lỗi từ Firebase hoặc từ backend
      setError(
        err.response?.data?.message || // Lỗi từ API backend của bạn
          err.message || // Lỗi từ Firebase client-side
          "Social login failed. Please try again." // Lỗi mặc định
      );
    } finally {
      setLoading(false);
    }
  };
  // Hàm xử lý khi submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (isRegisterMode) {
        // Gọi API đăng ký
        response = await authService.register({ fullName, email, password });
      } else {
        // Gọi API đăng nhập
        response = await authService.signIn({ email, password });
      }
      const { token, ...userData } = response;
      login(userData, token); // Cập nhật global state và localStorage
    } catch (err: any) {
      // Hiển thị lỗi từ backend
      setError(
        err.response?.data?.message ||
          "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card" ref={cardRef}>
      <h1>{isRegisterMode ? "Create Account" : "Log in"}</h1>
      <p className="subtitle">
        {isRegisterMode ? "Already have an account?" : "New to our network?"}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setIsRegisterMode(!isRegisterMode);
            setError(null);
          }}
        >
          {isRegisterMode ? " Log In" : " Sign up for free"}
        </a>
      </p>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        {isRegisterMode && (
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {!isRegisterMode && (
          <a href="#" className="forgot-password">
            Forgot password?
          </a>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Processing..." : isRegisterMode ? "Sign Up" : "Log In"}
        </button>

        <div className="social-logins">
          {/* Nút Facebook */}
          <button
            type="button"
            className="btn-social"
            onClick={() => handleSocialLogin(new FacebookAuthProvider())}
          >
            <FontAwesomeIcon icon={faFacebookF} />
          </button>

          {/* Nút Google */}
          <button
            type="button"
            className="btn-social"
            onClick={() => handleSocialLogin(new GoogleAuthProvider())}
          >
            <FontAwesomeIcon icon={faGoogle} />
          </button>

          {/* Nút Twitter */}
          <button
            type="button"
            className="btn-social"
            onClick={() => handleSocialLogin(new TwitterAuthProvider())}
          >
            <FontAwesomeIcon icon={faTwitter} />
          </button>
        </div>

        <button type="button" className="btn btn-outline">
          <FontAwesomeIcon icon={faLock} className="icon-left" /> Log in with
          SSO
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
