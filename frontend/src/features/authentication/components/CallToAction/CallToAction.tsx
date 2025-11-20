import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";

import "./CallToAction.css";

gsap.registerPlugin(ScrollTrigger);

const CallToAction: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sectionEl = sectionRef.current;

    if (sectionEl) {
      // Animation cho toàn bộ section, scale nhẹ và fade in
      gsap.fromTo(
        sectionEl,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top 85%",
          },
        }
      );
    }
  }, []);

  return (
    <section className="cta-section" ref={sectionRef}>
      <div className="cta-content">
        <h2>Sẵn Sàng Trải Nghiệm Dịch Vụ Địa Phương Tốt Nhất?</h2>
        <p>
          Tạo tài khoản miễn phí ngay hôm nay và bắt đầu kết nối với hàng ngàn
          chuyên gia trong khu vực của bạn.
        </p>
        <Link to="/login?mode=register" className="btn btn-secondary">
          Bắt Đầu Ngay
        </Link>
      </div>
    </section>
  );
};

export default CallToAction;
