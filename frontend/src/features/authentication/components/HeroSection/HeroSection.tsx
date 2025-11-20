import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

import "./HeroSection.css";
import heroIllustration from "../../../../assets/illustrations/hero-illustration.png";

const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const illustrationRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Tạo một timeline GSAP để các animation chạy tuần tự
    const tl = gsap.timeline({
      defaults: { duration: 0.8, ease: "power3.out" },
    });

    if (sectionRef.current) {
      tl.fromTo(titleRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0 })
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0 },
          "-=0.6"
        ) // Chạy sau 0.6s so với cái trước
        .fromTo(
          formRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0 },
          "-=0.6"
        )
        .fromTo(
          illustrationRef.current,
          { opacity: 0, x: 100 },
          { opacity: 1, x: 0 },
          "-=0.7"
        );
    }
  }, []);

  return (
    <section className="hero-section" ref={sectionRef}>
      <div className="hero-container">
        <div className="hero-content">
          <h1 ref={titleRef}>
            Dịch Vụ Địa Phương.
            <br />
            Chỉ Trong Tầm Tay.
          </h1>
          <p className="subtitle" ref={subtitleRef}>
            Kết nối với chuyên gia, mọi lúc là, mọi nơi
          </p>
          <form className="search-form" ref={formRef}>
            <div className="search-input-wrapper">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input type="text" placeholder="Tìm kiếm dịch vụ..." />
            </div>
            <button type="submit" className="btn btn-secondary">
              Tìm Kiếm
            </button>
          </form>
        </div>
        <div className="hero-illustration">
          <img
            src={heroIllustration}
            alt="Local services connection illustration"
            ref={illustrationRef}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
