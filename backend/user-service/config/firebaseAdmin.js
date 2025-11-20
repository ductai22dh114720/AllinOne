const admin = require("firebase-admin");

try {
  // Lấy chuỗi JSON từ biến môi trường mà bạn đã set trên Render
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountString) {
    throw new Error(
      "Biến môi trường FIREBASE_SERVICE_ACCOUNT chưa được thiết lập."
    );
  }

  // Parse chuỗi JSON đó thành một object
  const serviceAccount = JSON.parse(serviceAccountString);

  // Khởi tạo Firebase Admin với object credentials
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase Admin SDK đã được khởi tạo thành công.");
} catch (error) {
  console.error("Lỗi khi khởi tạo Firebase Admin SDK:", error.message);
  // Dừng ứng dụng nếu không thể kết nối Firebase, vì các tính năng liên quan sẽ lỗi
  process.exit(1);
}

module.exports = admin;
