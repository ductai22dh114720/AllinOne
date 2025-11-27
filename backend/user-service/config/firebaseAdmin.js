const admin = require("firebase-admin");
try {
  let serviceAccount;

  // KIỂM TRA: Ưu tiên dùng biến môi trường FIREBASE_SERVICE_ACCOUNT (cho Render/deploy)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log(
      "Đang chạy ở môi trường Production/Deploy, đọc credentials từ biến môi trường."
    );
    // Parse chuỗi JSON từ biến môi trường
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Nếu không có biến môi trường, đọc từ file JSON (cho local development)
    console.log(
      "Đang chạy ở môi trường Local, đọc credentials từ file serviceAccountKey.json."
    );
    // Đọc từ file JSON như cũ
    serviceAccount = require("../serviceAccountKey.json");
  }

  // Khởi tạo Firebase Admin với credentials đã chọn
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase Admin SDK đã được khởi tạo thành công.");
} catch (error) {
  console.error(
    "Lỗi nghiêm trọng khi khởi tạo Firebase Admin SDK:",
    error.message
  );
  process.exit(1);
}

module.exports = admin;
