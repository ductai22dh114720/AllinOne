// src/pages/HomePage/HomePage.tsx
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "../../features/authentication/components/Header/Header";
import HeroSection from "../../features/authentication/components/HeroSection/HeroSection";
import HowItWorks from "../../features/authentication/components/HowItWorks/HowItWorks";
import FeaturedCategories from "../../features/authentication/components/FeaturedCategories/FeaturedCategories";
import BecomeProvider from "../../features/authentication/components/BecomeProvider/BecomeProvider";
import Testimonials from "../../features/authentication/components/Testimonials/Testimonials";
import CallToAction from "../../features/authentication/components/CallToAction/CallToAction";
import Footer from "../../features/authentication/components/Footer/Footer";

import "../HomePage/HomePage.css"; // Import CSS cho HomePage

// Đăng ký plugin ScrollTrigger với GSAP
gsap.registerPlugin(ScrollTrigger);

const HomePage: React.FC = () => {
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animation tổng thể cho toàn bộ nội dung trang
    if (mainContentRef.current) {
      gsap.fromTo(
        mainContentRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );
    }

    // Các animation khác sẽ được thêm vào trong từng component con
    // và sử dụng ScrollTrigger để kích hoạt khi cuộn.

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="homepage-wrapper">
      <Header />
      <main ref={mainContentRef} className="homepage-main-content">
        <HeroSection />
        <HowItWorks />
        <FeaturedCategories />
        <BecomeProvider />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
