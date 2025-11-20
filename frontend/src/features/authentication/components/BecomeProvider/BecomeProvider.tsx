import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import "./BecomeProvider.css";
import providerIllustration from "../../../../assets/illustrations/illustration-provider-growth.png"; // Dùng path alias cho gọn

// Import icon từ FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

gsap.registerPlugin(ScrollTrigger);

const BecomeProvider: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const illustrationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const contentEl = contentRef.current;
    const illustrationEl = illustrationRef.current;

    if (sectionEl && contentEl && illustrationEl) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: "top 70%",
        },
      });

      tl.fromTo(
        contentEl,
        { opacity: 0, x: -100 },
        { opacity: 1, x: 0, duration: 1, ease: "power3.out" }
      ).fromTo(
        illustrationEl,
        { opacity: 0, x: 100 },
        { opacity: 1, x: 0, duration: 1, ease: "power3.out" },
        "-=0.8" // Chạy gần như cùng lúc với content
      );
    }
  }, []);

  return (
    <section className="become-provider-section" ref={sectionRef}>
      {/* ĐẢO VỊ TRÍ: Đưa ảnh lên trước */}
      <div className="provider-illustration" ref={illustrationRef}>
        <img
          src={providerIllustration}
          alt="Illustration of a service provider growing their business"
        />
      </div>

      {/* Đưa nội dung xuống sau */}
      <div className="provider-content" ref={contentRef}>
        <span className="section-subtitle">Dành cho nhà cung cấp</span>
        <h2>Phát Triển Kinh Doanh Của Bạn Cùng Chúng Tôi</h2>
        <p>
          Tiếp cận hàng ngàn khách hàng tiềm năng trong khu vực của bạn, quản lý
          lịch trình và phát triển thương hiệu cá nhân một cách dễ dàng.
        </p>
        <ul className="benefits-list">
          <li>
            <FontAwesomeIcon icon={faCircleCheck} className="check-icon" />
            Tăng thu nhập ổn định
          </li>
          <li>
            <FontAwesomeIcon icon={faCircleCheck} className="check-icon" />
            Lịch làm việc linh hoạt
          </li>
          <li>
            <FontAwesomeIcon icon={faCircleCheck} className="check-icon" />
            Xây dựng uy tín chuyên nghiệp
          </li>
        </ul>
        {/* THAY ĐỔI NÚT: Dùng màu phụ để nổi bật trên nền chính */}
        <Link to="/login?mode=register" className="btn btn-secondary">
          Đăng Ký Ngay
        </Link>
      </div>
    </section>
  );
};

export default BecomeProvider;
