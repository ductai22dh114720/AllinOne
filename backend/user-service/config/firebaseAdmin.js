const admin = require("firebase-admin");
try {
  let serviceAccount;

  // KIỂM TRA: Nếu đang ở môi trường production (trên Render)
  if (
    process.env.NODE_ENV === "production" &&
    process.env.FIREBASE_SERVICE_ACCOUNT
  ) {
    console.log(
      "Đang chạy ở môi trường Production, đọc credentials từ biến môi trường."
    );
    // Parse chuỗi JSON từ biến môi trường
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Nếu đang ở môi trường local
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
