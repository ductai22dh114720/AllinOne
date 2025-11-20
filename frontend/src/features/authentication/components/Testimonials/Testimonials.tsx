import React from "react";
import Slider from "react-slick"; // 1. Import component Slider

// 2. Import CSS của React Slick
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import "./Testimonials.css";

// Import các ảnh avatar
import avatar1 from "../../../../assets/illustrations/avatar-user-01.png";
import avatar2 from "../../../../assets/illustrations/avatar-user-02.png";
import avatar3 from "../../../../assets/illustrations/avatar-user-01.png";
import avatar4 from "../../../../assets/illustrations/avatar-user-02.png";

// Import icon quote
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuoteLeft } from "@fortawesome/free-solid-svg-icons";

// Dữ liệu testimonials (giữ nguyên)
const testimonialsData = [
  {
    quote:
      "Dịch vụ nhanh chóng, chuyên nghiệp và cực kỳ đáng tin cậy. Tôi đã tìm được thợ sửa ống nước chỉ trong 15 phút. Sẽ tiếp tục sử dụng!",
    name: "Chị Minh Anh",
    role: "Khách hàng tại Q.1",
    avatar: avatar1,
  },
  {
    quote:
      "Là một freelancer, nền tảng này đã giúp tôi tiếp cận được rất nhiều khách hàng mới. Giao diện quản lý công việc rất trực quan và dễ sử dụng.",
    name: "Anh Quốc Bảo",
    role: "Nhà cung cấp dịch vụ",
    avatar: avatar2,
  },
  {
    quote:
      "Thật tuyệt vời khi có thể tìm thấy một người trông trẻ đáng tin cậy ngay trong khu phố của mình. Ứng dụng hoạt động rất mượt mà.",
    name: "Chị Thu Hà",
    role: "Khách hàng tại TP. Thủ Đức",
    avatar: avatar3,
  },
  {
    quote:
      "Lượng khách hàng của tôi đã tăng 40% kể từ khi tham gia. Đây thực sự là một kênh marketing hiệu quả cho các doanh nghiệp nhỏ như chúng tôi.",
    name: "Anh Hùng Dũng",
    role: "Chủ tiệm sửa chữa",
    avatar: avatar4,
  },
];

const Testimonials: React.FC = () => {
  // 3. Cấu hình cho slider
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 1,
          arrows: false, // Ẩn mũi tên trên mobile
        },
      },
    ],
    autoplay: true,
    autoplaySpeed: 3000, // Tự động trượt sau mỗi 3 giây
    pauseOnHover: true, // Dừng lại khi người dùng rê chuột vào
  };

  return (
    <section className="testimonials-section">
      <h2>Khách Hàng & Đối Tác Nói Gì Về Chúng Tôi</h2>

      {/* 4. Sử dụng Slider component */}
      <div className="slider-container">
        <Slider {...settings}>
          {testimonialsData.map((testimonial, index) => (
            <div key={index} className="testimonial-slide-wrapper">
              <div className="testimonial-card">
                <FontAwesomeIcon icon={faQuoteLeft} className="quote-icon" />
                <p className="quote-text">"{testimonial.quote}"</p>
                <div className="author-info">
                  <img
                    src={testimonial.avatar}
                    alt={`Avatar of ${testimonial.name}`}
                  />
                  <div className="author-details">
                    <span className="author-name">{testimonial.name}</span>
                    <span className="author-role">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Testimonials;
