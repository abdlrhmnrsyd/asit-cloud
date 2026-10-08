# ☁️ Asit Cloud — Modern Personal Cloud Storage

**Asit Cloud** adalah aplikasi *personal cloud storage* modern yang dirancang menyerupai Google Drive, Linear, dan Dropbox. Arsitektur aplikasi ini menggunakan **Telegram Private Channel** sebagai *actual file storage engine* (unlimited file storage) dan **Firebase Cloud Firestore** untuk menyimpan metadata, hierarki folder, serta relasi kepemilikan file secara terstruktur dan cepat.

---

## 🏛️ 1. Architecture Overview

```text
       ┌───────────────────────────────────────────────┐
       │         React TypeScript Frontend (Vite)      │
       │  (Tailwind CSS, Lucide Icons, Modern UI/UX)   │
       └───────────────────────┬───────────────────────┘
                               │
                               │ HTTP REST API (JWT Bearer)
                               ▼
       ┌───────────────────────────────────────────────┐
       │           Node.js Express Backend             │
       │    (Streaming, Ownership Auth, Validation)    │
       └──────────────┬──────────────────┬─────────────┘
                      │                  │
                      │ Metadata         │ Binary Storage
                      ▼                  ▼
       ┌──────────────────────┐  ┌─────────────────────┐
       │  Firebase Firestore  │  │ Telegram Bot API    │
       │   (users, files,     │  │  (Private Channel   │
       │      folders)        │  │     Storage)        │
       └──────────────────────┘  └─────────────────────┘
```

### Pemisahan Tanggung Jawab (Separation of Concerns):
- **React Frontend**: UI Dashboard, file explorer, multi-file upload drag & drop with progress, nested folder breadcrumbs, context menu, in-app file preview (images, videos, audio, PDF, code), search debounce, dan responsive layout.
- **Express Backend**: Autentikasi JWT & bcrypt, validasi kepemilikan file (*ownership verification*), streaming download langsung dari Telegram, pengelolaan pesan Telegram, dan penanganan error terpusat (*centralized error handler*).
- **Firebase Firestore**: Database dokumen metadata (`users`, `files`, `folders`). **Tidak menyimpan binary file**.
- **Telegram Channel**: Engine penyimpanan binary file aktual menggunakan Telegram Bot API (`sendDocument`, `getFile`, `deleteMessage`).

---

## 📂 2. Project Directory Structure

```text
Asit-Cloud/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js                      # Centralized environment loader
│   │   │   └── firebase.js                 # Firebase Admin SDK initialization
│   │   ├── controllers/
│   │   │   ├── auth.controller.js          # Register, Login, Me handlers
│   │   │   ├── file.controller.js          # Upload, Stream Download, Move, Rename, Delete
│   │   │   └── folder.controller.js        # CRUD Folders & Breadcrumbs
│   │   ├── services/
│   │   │   ├── auth.service.js             # Auth business logic & JWT
│   │   │   ├── file.service.js             # Firestore file sync & Telegram orchestration
│   │   │   ├── folder.service.js           # Nested folders & cascading operations
│   │   │   └── telegram.service.js         # Telegram Bot API client
│   │   ├── routes/
│   │   │   ├── auth.routes.js              # /api/auth endpoints
│   │   │   ├── file.routes.js              # /api/files endpoints
│   │   │   └── folder.routes.js            # /api/folders endpoints
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js          # JWT verification & req.user injector
│   │   │   ├── error.middleware.js         # Centralized error handler & AppError
│   │   │   └── upload.middleware.js        # Multer memory storage
│   │   ├── utils/
│   │   │   ├── file.js                     # File categories & sanitization helpers
│   │   │   └── response.js                 # Standardized JSON response format
│   │   └── server.js                       # Express app bootstrap & route mounting
│   ├── firebase-service-account.json       # Firebase Admin credentials (Private)
│   ├── test-api.js                         # Integration test suite
│   ├── .env                                # Backend environment configuration
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts                   # Axios client with JWT interceptors
│   │   │   ├── auth.api.ts                 # Auth API calls
│   │   │   ├── files.api.ts                # Files API calls & download handling
│   │   │   └── folders.api.ts              # Folders API calls
│   │   ├── components/
│   │   │   ├── layout/                     # AppLayout, Sidebar, Header, Breadcrumbs
│   │   │   ├── files/                      # FileCard, FileRow, FileGrid, FileList, ContextMenu, Previews
│   │   │   ├── folders/                    # FolderCard, FolderGrid, Create/Rename modals
│   │   │   ├── upload/                     # UploadDropzone, UploadModal
│   │   │   └── ui/                         # Button, Input, Modal, Toast, Skeleton, EmptyState
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx             # Global authentication state
│   │   ├── hooks/
│   │   │   ├── useAuth.ts                  # Auth hook
│   │   │   ├── useFiles.ts                 # Files CRUD, storage, and sorting hook
│   │   │   ├── useFolders.ts               # Folder management hook
│   │   │   └── useDebounce.ts              # Search debouncing hook
│   │   ├── pages/
│   │   │   ├── Login.tsx                   # User login page
│   │   │   ├── Register.tsx                # User registration page
│   │   │   ├── Dashboard.tsx               # Analytics, storage overview & recent files
│   │   │   ├── FilesPage.tsx               # Full file explorer & nested folders
│   │   │   ├── StarredPage.tsx             # Starred files view
│   │   │   ├── TrashPage.tsx               # Soft-deleted & permanent deletion view
│   │   │   └── NotFound.tsx                # 404 page
│   │   ├── types/                          # Strongly-typed TypeScript interfaces
│   │   ├── utils/                          # File size, date, and category icon helpers
│   │   ├── App.tsx                         # React Router DOM configuration
│   │   ├── main.tsx
│   │   └── index.css                       # Tailwind CSS & custom design system
│   ├── .env
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md
```

---

## ⚡ 3. Quick Start & Development

### Prasyarat
- Node.js (v18+ atau v20+)
- NPM
- Akun Telegram (Bot Token & Channel ID)
- Proyek Firebase dengan Cloud Firestore aktif

### 1. Setup Backend
```bash
cd backend
npm install

# Salin konfigurasi environment
cp .env.example .env
```

Pastikan file `backend/.env` terisi:
```env
PORT=3000
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHANNEL_ID=-1004314414657
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
```

Pastikan file `backend/firebase-service-account.json` berada di root folder `backend/`.

Jalankan backend server:
```bash
npm run dev
```
Server berjalan di `http://localhost:3000`.

### 2. Setup Frontend
```bash
cd frontend
npm install

# Salin konfigurasi environment
cp .env.example .env
```

Pastikan `frontend/.env` terisi:
```env
VITE_API_URL=http://localhost:3000/api
```

Jalankan frontend server:
```bash
npm run dev
```
Aplikasi web berjalan di `http://localhost:5173`.

---

## 🧪 4. Testing Suite

Backend dilengkapi dengan automated integration test suite yang memverifikasi seluruh lifecycle:
```bash
cd backend
node test-api.js
```

Tes ini memvalidasi secara otomatis:
1. Health check & koneksi Firestore
2. Registrasi & Login pengguna
3. Fetch user profile (`/auth/me`)
4. Pembuatan folder bersarang
5. Upload file biner ke Telegram channel dan sinkronisasi metadata Firestore
6. Streaming binary file download dari Telegram melalui backend
7. Update & rename file
8. Perhitungan statistik kapasitas storage
9. Penghapusan file dari Telegram (`deleteMessage`) dan Firestore

---

## 📡 5. REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Mendaftarkan akun baru |
| `POST` | `/api/auth/login` | No | Login & mendapatkan JWT token |
| `GET` | `/api/auth/me` | Bearer | Mengambil profil user yang sedang aktif |

### Folders (`/api/folders`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/folders` | Bearer | Membuat folder baru (`name`, `parentId`) |
| `GET` | `/api/folders` | Bearer | Mengambil daftar folder (opsional: `?parentId=`) |
| `GET` | `/api/folders/:id` | Bearer | Mengambil detail folder & breadcrumb path |
| `PATCH` | `/api/folders/:id` | Bearer | Mengubah nama folder |
| `DELETE` | `/api/folders/:id` | Bearer | Menghapus folder & seluruh isinya (*cascade delete*) |

### Files (`/api/files`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/files/upload` | Bearer | Upload satu atau banyak file (Multipart form: `file`, `folderId`) |
| `GET` | `/api/files` | Bearer | Mengambil daftar file (`folderId`, `search`, `category`, `isStarred`, `sort`, `order`, `page`, `limit`) |
| `GET` | `/api/files/storage` | Bearer | Mengambil ringkasan statistik total storage & per-kategori |
| `GET` | `/api/files/:id` | Bearer | Mengambil metadata detail file |
| `GET` | `/api/files/:id/download` | Bearer | Streaming biner file untuk download atau preview (`?preview=true`) |
| `PATCH` | `/api/files/:id` | Bearer | Rename file atau toggle status star/trash |
| `PATCH` | `/api/files/:id/move` | Bearer | Memindahkan file ke folder lain (`folderId`) |
| `DELETE` | `/api/files/:id` | Bearer | Menghapus pesan di Telegram & dokumen di Firestore |

---

## 🔒 6. Security Architecture

1. **No Token Leakage**:
   - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`, dan `firebase-service-account.json` **hanya berada di backend**. Frontend tidak pernah menerima atau mengetahui kredensial storage.
2. **Strict Ownership Control**:
   - Setiap operasi membaca, mengunduh, mengubah, memindahkan, atau menghapus file/folder selalu memvalidasi `userId` milik pemilik dokumen melalui token JWT.
3. **Download Streaming**:
   - Backend melakukan *piping/streaming stream biner* langsung dari Telegram ke client browser tanpa menyimpan file secara temporer atau permanen di disk server backend.
4. **Password Hashing**:
   - Password pengguna di-hash menggunakan algoritma `bcryptjs` sebelum disimpan ke Firestore.

---

## 🎨 7. UI/UX Highlights

- **Linear / Dark Minimal Design**: Palet warna Slate & Indigo, micro-animations, dan tata letak modern.
- **Smart File Icons**: Ikon khusus untuk gambar, video, audio, PDF, Word, Excel, PowerPoint, arsip ZIP/RAR, dan kode pemrograman.
- **Live Search & Filter**: Pencarian real-time dengan *debouncing* dan filter per jenis berkas.
- **In-App Media Preview**: Viewer gambar, audio player, video player, PDF viewer, dan text/code viewer langsung di peramban.
- **Desktop Context Menu & Responsive Drawer**: Klik kanan untuk aksi cepat di desktop serta drawer navigasi yang nyaman di perangkat seluler.

---

*Dikembangkan untuk **Asit Cloud** — Production-grade Personal Cloud Storage.*
# asit-cloud
