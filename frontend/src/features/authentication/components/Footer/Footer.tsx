import React from "react";
import "./Footer.css";

import logo from "../../../../assets/logo.png"; // Giả sử logo của bạn có phiên bản sáng màu
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faInstagram,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const Footer: React.FC = () => {
  return (
    <footer className="site-footer-main">
      <div className="footer-content">
        {/* Cột 1: Thương hiệu */}
        <div className="footer-column brand-column">
          {/* Giả sử bạn có logo-light.svg cho nền tối */}
          <img src={logo} alt="Brand Logo" className="footer-logo" />
          <p>
            Nền tảng kết nối dịch vụ địa phương hàng đầu, giúp bạn tìm thấy
            chuyên gia phù hợp cho mọi nhu cầu.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Facebook">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="#" aria-label="Instagram">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="#" aria-label="Twitter">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
          </div>
        </div>

        {/* Cột 2: Các liên kết */}
        <div className="footer-column links-column">
          <h4>Về chúng tôi</h4>
          <ul>
            <li>
              <a href="#">Câu chuyện</a>
            </li>
            <li>
              <a href="#">Đội ngũ</a>
            </li>
            <li>
              <a href="#">Tuyển dụng</a>
            </li>
            <li>
              <a href="#">Báo chí</a>
            </li>
          </ul>
        </div>

        <div className="footer-column links-column">
          <h4>Hỗ trợ</h4>
          <ul>
            <li>
              <a href="#">Trung tâm trợ giúp</a>
            </li>
            <li>
              <a href="#">Điều khoản dịch vụ</a>
            </li>
            <li>
              <a href="#">Chính sách bảo mật</a>
            </li>
          </ul>
        </div>

        {/* Cột 3: Đăng ký nhận tin */}
        <div className="footer-column newsletter-column">
          <h4>Đăng ký nhận tin</h4>
          <p>
            Nhận các ưu đãi và thông tin mới nhất trực tiếp qua email của bạn.
          </p>
          <form className="newsletter-form">
            <input type="email" placeholder="Nhập email của bạn" />
            <button type="submit" aria-label="Subscribe">
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} All-in-One. Thiết kế và phát triển
          bởi chúng ta.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
