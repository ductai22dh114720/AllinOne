import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./HowItWorks.css";

// Import các icon từ FontAwesome (hoặc bạn có thể dùng ảnh illustration)
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGears,
  faHandshake,
  faLeaf,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";

// Đăng ký plugin nếu chưa làm ở HomePage
gsap.registerPlugin(ScrollTrigger);

const HowItWorks: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const titleEl = titleRef.current;
    const cards = gsap.utils.toArray<HTMLElement>(".how-it-works-card"); // Chuyển thành mảng GSAP

    if (sectionEl && titleEl && cards.length > 0) {
      // Animation cho tiêu đề (giữ nguyên)
      gsap.fromTo(
        titleEl,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionEl, start: "top 80%" },
        }
      );

      gsap.fromTo(
        cards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.2,
          scrollTrigger: { trigger: sectionEl, start: "top 70%" },
        }
      );

      // --- CẬP NHẬT LOGIC HOVER CỦA GSAP ---
      cards.forEach((card) => {
        const otherCards = cards.filter((c) => c !== card);

        const onMouseEnter = () => {
          gsap.to(card, {
            // Khi hover, card sẽ lớn hơn một chút và quay về kích thước gốc
            scale: 1,
            y: -5,
            boxShadow: "0 12px 30px rgba(74, 85, 129, 0.12)",
            duration: 0.4,
            ease: "power2.out",
          });
          gsap.to(otherCards, {
            // Các card khác sẽ nhỏ đi hơn nữa
            scale: 0.9,
            opacity: 0.7,
            duration: 0.4,
            ease: "power2.out",
          });
        };

        const onMouseLeave = () => {
          // Khi rời chuột, tất cả các card quay về trạng thái mặc định
          gsap.to(cards, {
            scale: 0.95, // Trạng thái mặc định trong CSS
            y: 0,
            opacity: 1,
            boxShadow: "0 8px 24px rgba(74, 85, 129, 0.08)",
            duration: 0.4,
            ease: "power2.out",
          });
        };

        card.addEventListener("mouseenter", onMouseEnter);
        card.addEventListener("mouseleave", onMouseLeave);

        // Cleanup function
        return () => {
          card.removeEventListener("mouseenter", onMouseEnter);
          card.removeEventListener("mouseleave", onMouseLeave);
        };
      });
    }
  }, []);

  return (
    <section className="how-it-works-section" ref={sectionRef}>
      <h2 ref={titleRef}>Giá Trị Cốt Lõi Của Chúng Tôi</h2>
      <div className="how-it-works-grid" ref={gridRef}>
        <div className="how-it-works-card">
          <div
            className="card-icon"
            style={{ backgroundColor: "rgba(255, 179, 150, 0.2)" }}
          >
            <FontAwesomeIcon icon={faGears} style={{ color: "#FFB396" }} />
          </div>
          <h3>Tùy Chỉnh Theo Nhu Cầu</h3>
          <p>
            Mọi yêu cầu đều được lắng nghe và đáp ứng để bạn có được dịch vụ ưng
            ý nhất.
          </p>
        </div>
        <div className="how-it-works-card">
          <div
            className="card-icon"
            style={{ backgroundColor: "rgba(74, 85, 129, 0.1)" }}
          >
            <FontAwesomeIcon icon={faHandshake} style={{ color: "#4A5581" }} />
          </div>
          <h3>Kết Nối Dễ Dàng</h3>
          <p>
            Tìm kiếm và kết nối với các chuyên gia địa phương chỉ trong vài thao
            tác đơn giản.
          </p>
        </div>
        <div className="how-it-works-card">
          <div
            className="card-icon"
            style={{ backgroundColor: "rgba(123, 140, 108, 0.2)" }}
          >
            <FontAwesomeIcon
              icon={faShieldHalved}
              style={{ color: "#7B8C6C" }}
            />
          </div>
          <h3>Đáng Tin Cậy & An Toàn</h3>
          <p>
            Các nhà cung cấp dịch vụ đều được xác minh để đảm bảo chất lượng và
            sự an tâm cho bạn.
          </p>
        </div>
        <div className="how-it-works-card">
          <div
            className="card-icon"
            style={{ backgroundColor: "rgba(245, 176, 65, 0.2)" }}
          >
            <FontAwesomeIcon icon={faLeaf} style={{ color: "#F5B041" }} />
          </div>
          <h3>Hỗ Trợ Cộng Đồng</h3>
          <p>
            Sử dụng dịch vụ của chúng tôi là bạn đang góp phần hỗ trợ các doanh
            nghiệp địa phương.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
