import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { type Service } from "../../../types/map";

// Sửa lỗi icon marker (giữ nguyên)
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Định nghĩa props (giữ nguyên)
interface MapProps {
  services: Service[];
  userLocation: [number, number];
  selectedServiceId: string | null;
  onMarkerClick: (id: string) => void;
}

// --- COMPONENT MỚI: Dùng để điều khiển bản đồ từ props ---
const MapController: React.FC<{ selectedService: Service | undefined }> = ({
  selectedService,
}) => {
  const map = useMap(); // Lấy instance của bản đồ cha

  useEffect(() => {
    // Chỉ thực thi khi có một dịch vụ được chọn
    if (selectedService) {
      const { coordinates } = selectedService.location;
      const latLng: L.LatLngTuple = [coordinates[1], coordinates[0]]; // [vĩ độ, kinh độ]

      // Di chuyển mượt mà đến vị trí của dịch vụ được chọn
      map.flyTo(latLng, 16, {
        // Zoom gần hơn một chút
        animate: true,
        duration: 1.5, // Thời gian di chuyển
      });

      // Mở popup tại vị trí đó
      // Cần một chút delay để popup mở sau khi bản đồ đã di chuyển xong
      const popupContent = `<b>${selectedService.serviceName}</b><br/>${selectedService.address.street}`;
      setTimeout(() => {
        L.popup().setLatLng(latLng).setContent(popupContent).openOn(map);
      }, 1000); // 1 giây delay
    }
  }, [selectedService, map]); // useEffect này sẽ chạy lại mỗi khi selectedService thay đổi

  return null; // Component này không render ra gì cả
};

// Component chính
const MapComponent: React.FC<MapProps> = ({
  services,
  userLocation,
  selectedServiceId,
  onMarkerClick,
}) => {
  // Tìm object service tương ứng với ID được chọn
  const selectedService = services.find((s) => s._id === selectedServiceId);

  return (
    <MapContainer
      center={userLocation}
      zoom={14}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Ghim vị trí người dùng */}
      <Marker position={userLocation}>
        <Popup>Vị trí của bạn</Popup>
      </Marker>

      {/* Ghim các dịch vụ */}
      {services.map((service) => (
        <Marker
          key={service._id}
          position={[
            service.location.coordinates[1],
            service.location.coordinates[0],
          ]}
          eventHandlers={{
            click: () => {
              // Khi click vào ghim, báo cho component cha biết ID của dịch vụ này
              onMarkerClick(service._id);
            },
          }}
        >
          {/* Popup này vẫn cần để mở khi click trực tiếp */}
          <Popup>
            <b>{service.serviceName}</b>
            <br />
            {service.address.formatted || service.address.street}
            {service.phone && (
              <>
                <br />
                SĐT: {service.phone}
              </>
            )}
            {service.rating && service.rating > 0 && (
              <>
                <br />
                Đánh giá: {service.rating} ⭐ ({service.numReviews} lượt)
              </>
            )}
            {service.website && (
              <>
                <br />
                <a
                  href={service.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Website
                </a>
              </>
            )}
          </Popup>
        </Marker>
      ))}

      {/* Thêm component điều khiển vào bên trong bản đồ */}
      <MapController selectedService={selectedService} />
    </MapContainer>
  );
};

export default MapComponent;
