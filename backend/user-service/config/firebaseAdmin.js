const admin = require("firebase-admin");

// Đường dẫn này trỏ đến file key ở thư mục gốc của dự án
const serviceAccount = require("../serviceAccountKey.json");

// Hàm để khởi tạo, đảm bảo chỉ chạy một lần
const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  }
};

// Khởi tạo ngay khi file này được require
initializeFirebaseAdmin();

// Xuất ra instance đã được khởi tạo để các file khác có thể dùng
module.exports = admin;
