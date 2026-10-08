const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const API_URL = "http://localhost:3000/api";

const testBackend = async () => {
  console.log("🚀 Starting Backend Integration Test...\n");

  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = "Password123!";
  let token = "";
  let folderId = "";
  let fileId = "";

  try {
    // 1. Health Check
    console.log("1️⃣ Testing /health endpoint...");
    const healthRes = await axios.get(`${API_URL}/health`);
    console.log("✅ Health response:", healthRes.data);

    // 2. Register
    console.log("\n2️⃣ Testing /auth/register...");
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      name: "Asit Test User",
      email: testEmail,
      password: testPassword,
    });
    console.log("✅ Register response:", regRes.data.message);
    token = regRes.data.data.token;

    const authHeaders = {
      headers: { Authorization: `Bearer ${token}` },
    };

    // 3. Login
    console.log("\n3️⃣ Testing /auth/login...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: testPassword,
    });
    console.log("✅ Login response:", loginRes.data.message);

    // 4. Get Current User /auth/me
    console.log("\n4️⃣ Testing /auth/me...");
    const meRes = await axios.get(`${API_URL}/auth/me`, authHeaders);
    console.log("✅ Me response:", meRes.data.data.user.name, meRes.data.data.user.email);

    // 5. Create Folder
    console.log("\n5️⃣ Testing /folders (Create folder)...");
    const folderRes = await axios.post(
      `${API_URL}/folders`,
      { name: "Documents 2025" },
      authHeaders
    );
    folderId = folderRes.data.data.id;
    console.log("✅ Folder created:", folderRes.data.data.name, "ID:", folderId);

    // 6. Get Folders
    console.log("\n6️⃣ Testing GET /folders...");
    const foldersListRes = await axios.get(`${API_URL}/folders`, authHeaders);
    console.log("✅ Folders count:", foldersListRes.data.data.folders.length);

    // 7. Upload File to Telegram & Firestore
    console.log("\n7️⃣ Testing POST /files/upload...");
    const form = new FormData();
    const dummyBuffer = Buffer.from("Hello Asit Cloud! Telegram Storage + Firestore Integration is working seamlessly! 🚀", "utf-8");
    form.append("file", dummyBuffer, {
      filename: "asit_test_document.txt",
      contentType: "text/plain",
    });
    form.append("folderId", folderId);

    const uploadRes = await axios.post(`${API_URL}/files/upload`, form, {
      headers: {
        ...authHeaders.headers,
        ...form.getHeaders(),
      },
    });
    fileId = uploadRes.data.data.file.id;
    console.log("✅ Uploaded file ID:", fileId);
    console.log("   Telegram Message ID:", uploadRes.data.data.file.telegramMessageId);
    console.log("   Telegram File ID:", uploadRes.data.data.file.telegramFileId);

    // 8. Get Files List
    console.log("\n8️⃣ Testing GET /files...");
    const filesRes = await axios.get(`${API_URL}/files?folderId=${folderId}`, authHeaders);
    console.log("✅ Files found in folder:", filesRes.data.data.files.length);

    // 9. Download File Stream
    console.log("\n9️⃣ Testing GET /files/:id/download...");
    const downloadRes = await axios.get(`${API_URL}/files/${fileId}/download`, {
      ...authHeaders,
      responseType: "arraybuffer",
    });
    const downloadedContent = Buffer.from(downloadRes.data).toString("utf-8");
    console.log("✅ Downloaded content length:", downloadedContent.length);
    console.log("   Preview of downloaded content:", downloadedContent.substring(0, 35) + "...");

    // 10. Update/Rename File
    console.log("\n🔟 Testing PATCH /files/:id (Rename)...");
    const renameRes = await axios.patch(
      `${API_URL}/files/${fileId}`,
      { name: "renamed_document.txt", isStarred: true },
      authHeaders
    );
    console.log("✅ File renamed to:", renameRes.data.data.file.name, "isStarred:", renameRes.data.data.file.isStarred);

    // 11. Storage Info
    console.log("\n1️⃣1️⃣ Testing GET /files/storage...");
    const storageRes = await axios.get(`${API_URL}/files/storage`, authHeaders);
    console.log("✅ Storage stats:", storageRes.data.data);

    // 12. Delete File
    console.log("\n1️⃣2️⃣ Testing DELETE /files/:id...");
    const deleteRes = await axios.delete(`${API_URL}/files/${fileId}`, authHeaders);
    console.log("✅ File deleted successfully:", deleteRes.data.success);

    // 13. Delete Folder
    console.log("\n1️⃣3️⃣ Testing DELETE /folders/:id...");
    const deleteFolderRes = await axios.delete(`${API_URL}/folders/${folderId}`, authHeaders);
    console.log("✅ Folder deleted successfully:", deleteFolderRes.data.success);

    console.log("\n🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY! 💯");
  } catch (error) {
    console.error("\n❌ Test Failed:", error.response?.data || error.message);
  }
};

testBackend();
