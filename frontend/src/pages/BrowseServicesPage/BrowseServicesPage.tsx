import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import MapComponent from "../../components/common/Map/MapComponent";
import FilterBar from "../../components/common/FilterBar/FilterBar";
import "./BrowseServicesPage.css";
import { type Service } from "../../types/map";

const CATEGORIES = [
  "Tất cả",
  "Sửa chữa nhà cửa",
  "Gia sư",
  "Vệ sinh",
  "Làm đẹp",
  "Chăm sóc thú cưng",
  "Khác",
];
const BrowseServicesPage: React.FC = () => {
  // --- Các State ban đầu của bạn (giữ nguyên) ---
  const [originalServices, setOriginalServices] = useState<Service[]>([]); // Lưu danh sách gốc từ API
  const [filteredServices, setFilteredServices] = useState<Service[]>([]); // Danh sách đã lọc để hiển thị
  const [services, setServices] = useState<Service[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [sortBy, setSortBy] = useState<string>("distance"); // Mặc định sắp xếp theo khoảng cách

  // --- Logic nâng cấp: Thêm useRef và hằng số ---
  const watchIdRef = useRef<number | null>(null);
  const lastFetchedLocation = useRef<[number, number] | null>(null);
  const DISTANCE_THRESHOLD = 500; // Ngưỡng 500 mét

  // --- Logic nâng cấp: Hàm tính khoảng cách ---
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // --- Logic nâng cấp: Thay thế useEffect cũ bằng useEffect theo dõi vị trí ---
  useEffect(() => {
    const initializeMapAndFetch = (lat: number, lng: number) => {
      setUserLocation([lat, lng]);
      lastFetchedLocation.current = [lat, lng];
      fetchNearbyServices(lng, lat);
    };

    const handlePositionSuccess = (position: GeolocationPosition) => {
      const currentLat = position.coords.latitude;
      const currentLng = position.coords.longitude;
      if (!lastFetchedLocation.current) {
        console.log("Lần đầu lấy vị trí:", currentLat, currentLng);
        initializeMapAndFetch(currentLat, currentLng);
      } else {
        const [lastLat, lastLng] = lastFetchedLocation.current;
        const distance = calculateDistance(
          lastLat,
          lastLng,
          currentLat,
          currentLng
        );
        if (distance >= DISTANCE_THRESHOLD) {
          console.log(
            `Di chuyển ${distance.toFixed(2)}m, đang cập nhật dịch vụ...`
          );
          initializeMapAndFetch(currentLat, currentLng);
        } else {
          // Chỉ cập nhật vị trí icon người dùng trên bản đồ, không gọi API
          setUserLocation([currentLat, currentLng]);
        }
      }
    };

    const handlePositionError = (geoError: GeolocationPositionError) => {
      console.warn("Lỗi Geolocation, sử dụng vị trí mặc định.", geoError);
      setError(
        "Không thể lấy vị trí. Hiển thị các dịch vụ ở khu vực mặc định."
      );
      // Mặc định về trung tâm TPHCM nếu không lấy được vị trí
      initializeMapAndFetch(10.7769, 106.7009);
    };

    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePositionSuccess,
        handlePositionError,
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      handlePositionError({
        code: 0,
        message: "Geolocation not supported",
      } as GeolocationPositionError);
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []); // [] rỗng để chỉ chạy 1 lần khi component mount

  // --- Hàm fetchNearbyServices và handleSelection (giữ nguyên) ---
  const fetchNearbyServices = async (longitude: number, latitude: number) => {
    // Không setLoading(true) ở đây nữa để tránh màn hình loading che phủ khi tự động cập nhật
    setError(null);
    try {
      const radius = 10000; // 10km
      const response = await axios.get(
        `http://localhost:5002/api/services/nearby?lng=${longitude}&lat=${latitude}&radius=${radius}`
      );
      setOriginalServices(response.data); // Cập nhật danh sách gốc
      setFilteredServices(response.data); // Cập nhật cả danh sách hiển thị ban đầu
      setServices(response.data);
    } catch (err) {
      console.error("API Error:", err);
      setError("Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false); // Tắt loading chung sau lần fetch đầu tiên
    }
  };

  const handleApplyFilters = () => {
    let servicesToProcess = [...originalServices];

    // 1. Lọc theo Danh mục
    if (selectedCategory !== "Tất cả") {
      servicesToProcess = servicesToProcess.filter(
        (service) => service.category === selectedCategory
      );
    }

    // 2. Sắp xếp theo tiêu chí
    if (userLocation) {
      const [userLat, userLng] = userLocation;
      servicesToProcess.sort((a, b) => {
        switch (sortBy) {
          case "rating_desc":
            return (b.rating || 0) - (a.rating || 0);
          case "price_asc":
            return (a.price || 0) - (b.price || 0);
          case "price_desc":
            return (b.price || 0) - (a.price || 0);
          case "distance":
          default:
            const distA = calculateDistance(
              userLat,
              userLng,
              a.location.coordinates[1],
              a.location.coordinates[0]
            );
            const distB = calculateDistance(
              userLat,
              userLng,
              b.location.coordinates[1],
              b.location.coordinates[0]
            );
            return distA - distB;
        }
      });
    }

    setFilteredServices(servicesToProcess);
  };

  const handleSelection = (serviceId: string) => {
    setSelectedServiceId(serviceId);
  };
  // --- Giao diện JSX: Giữ nguyên cấu trúc từ file gốc của bạn và thêm hiển thị khoảng cách ---
  return (
    <div className="browse-page-container">
      <div className="browse-header">
        <h1>Tìm Dịch Vụ Quanh Bạn</h1>
        <p>Khám phá các dịch vụ được đánh giá cao ở ngay gần bạn.</p>
      </div>
      {/* BƯỚC 4: TÍCH HỢP FILTER BAR VÀ NÚT ÁP DỤNG */}
      <FilterBar
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSortBy}
        onApply={handleApplyFilters}
      />

      <div className="map-and-list-container">
        {loading && (
          <div className="loading-overlay">Đang tải và xác định vị trí...</div>
        )}
        {error && !loading && <div className="error-overlay">{error}</div>}

        {/* Luôn hiển thị map và list sau lần tải đầu tiên */}
        <div className="map-container">
          {userLocation && (
            <MapComponent
              services={filteredServices} // Hiển thị danh sách đã lọc trên bản đồ
              userLocation={userLocation}
              selectedServiceId={selectedServiceId}
              onMarkerClick={handleSelection}
            />
          )}
        </div>
        <div className="service-list-container">
          {/* Hiển thị số lượng kết quả đã lọc */}
          <h3>{filteredServices.length} dịch vụ được tìm thấy</h3>
          <div className="service-list">
            {/* Render danh sách đã lọc */}
            {filteredServices.map((service) => (
              <div
                key={service._id}
                className={`service-card ${
                  selectedServiceId === service._id ? "selected" : ""
                }`}
                onClick={() => handleSelection(service._id)}
              >
                <h4 className="service-card-title">{service.serviceName}</h4>

                {service.rating && service.rating > 0 && (
                  <div className="service-card-rating">
                    <span>{service.rating.toFixed(1)}</span>
                    <span className="star">⭐</span>
                    <span>({service.numReviews || 0})</span>
                  </div>
                )}

                <p className="service-card-address">
                  {service.address.formatted || service.address.street}
                </p>

                {/* THÊM MỚI: Hiển thị khoảng cách được tính toán */}
                {userLocation && (
                  <p className="service-card-address">
                    <strong>Khoảng cách:</strong>{" "}
                    {(
                      calculateDistance(
                        userLocation[0],
                        userLocation[1],
                        service.location.coordinates[1],
                        service.location.coordinates[0]
                      ) / 1000
                    ).toFixed(2)}{" "}
                    km
                  </p>
                )}

                <div className="service-card-category-wrapper">
                  <span className="service-card-category">
                    {service.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseServicesPage;
