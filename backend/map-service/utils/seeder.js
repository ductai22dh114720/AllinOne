const mongoose = require("mongoose");
const dotenv = require("dotenv");
const axios = require("axios");
const Map = require("../models/Map");
const connectDB = require("../config/db");

dotenv.config({ path: __dirname + "/../.env" });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runSeeder = async () => {
  try {
    await connectDB();

    const centerLat = 10.865565193495348;
    const centerLng = 106.60065491624145;
    const searchRadius = 5000;

    console.log("--- BẮT ĐẦU GIEO DỮ LIỆU TỪ OPENSTREETMAP ---");

    // Xóa tất cả dữ liệu cũ được gieo tự động
    await Map.deleteMany({ providerId: "osm-seeded-provider-id" });
    console.log("Đã xóa dữ liệu cũ...");

    // Các loại địa điểm cần lấy
    const placesToFetch = [
      { osmTag: 'amenity="pharmacy"', category: "Khác" },
      { osmTag: 'shop="hairdresser"', category: "Làm đẹp" },
      { osmTag: 'amenity="fuel"', category: "Khác" },
    ];

    for (const placeType of placesToFetch) {
      await fetchAndSeedData(
        centerLat,
        centerLng,
        searchRadius,
        placeType.osmTag,
        placeType.category
      );
      await sleep(1000); // Tạm dừng giữa các loại để tránh làm quá tải server Overpass
    }

    console.log("--- GIEO DỮ LIỆU HOÀN TẤT ---");
  } catch (error) {
    console.error("Lỗi nghiêm trọng khi chạy seeder:", error);
  } finally {
    process.exit();
  }
};

const fetchAndSeedData = async (lat, lng, radius, osmTag, category) => {
  try {
    console.log(
      `\nĐang lấy dữ liệu cho danh mục: ${category} (tag: ${osmTag})...`
    );

    const query = `
      [out:json][timeout:30];
      (
        node[${osmTag}][name](around:${radius},${lat},${lng});
        way[${osmTag}][name](around:${radius},${lat},${lng});
        relation[${osmTag}][name](around:${radius},${lat},${lng});
      );
      out center;
    `;

    const overpassUrl = "https://overpass-api.de/api/interpreter";
    const response = await axios.post(
      overpassUrl,
      `data=${encodeURIComponent(query)}`,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const places = response.data.elements;

    if (!places || places.length === 0) {
      console.log(`-> Không tìm thấy địa điểm nào.`);
      return;
    }

    const servicesToSeed = places.map((place) => {
      const coordinates = place.center
        ? [place.center.lon, place.center.lat]
        : [place.lon, place.lat];
      const streetAddress =
        place.tags["addr:housenumber"] && place.tags["addr:street"]
          ? `${place.tags["addr:housenumber"]} ${place.tags["addr:street"]}`
          : place.tags["addr:street"] || "Không rõ đường";

      return {
        providerId: "osm-seeded-provider-id",
        serviceName: place.tags.name,
        description: `Dịch vụ ${place.tags.name}. Dữ liệu được cung cấp bởi OpenStreetMap.`,
        category: category,
        phone: place.tags.phone || null,
        website: place.tags.website || null,
        address: {
          formatted: `${place.tags.name}, ${streetAddress}`,
          street: streetAddress,
        },
        location: {
          type: "Point",
          coordinates: coordinates,
        },
        // OSM không có sẵn dữ liệu rating
        rating: 0,
        numReviews: 0,
      };
    });

    if (servicesToSeed.length > 0) {
      await Map.insertMany(servicesToSeed);
      console.log(`-> Đã gieo thành công ${servicesToSeed.length} địa điểm.`);
    }
  } catch (error) {
    const errorMessage = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    console.error(`Lỗi khi gieo dữ liệu cho ${category}:`, errorMessage);
  }
};

runSeeder();
