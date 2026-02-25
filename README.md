# Tire Management System (TMS)

Sebuah aplikasi full-stack yang dikontainerisasi dengan Docker dan memiliki fitur lengkap untuk mengelola truk, trailer, dan masing-masing ban. TMS dirancang untuk manajemen kendaraan skala perusahaan dan menggunakan teknologi web modern untuk menyajikan pengalaman pengguna yang premium dengan gaya *glassmorphism*.

Repositori ini memiliki **Backend Node.js/Fastify** dan menawarkan fleksibilitas untuk berjalan bersama dua frontend yang identik fungsionalitasnya: **Frontend React** dan **Frontend Vue 3**. Anda dapat memilih mana yang ingin dijalankan!

---

**Dibuat oleh: Cahyo Adi Permono dari Imani Prima**

---

## 🚀 Fitur Utama

- **Manajemen Kendali Utama (Master Vehicle)**: Daftarkan dan kelola unit truk (Kepala Truk, Truk Ringan, Mobil, Sasis, Dolly).
- **Manajemen Konfigurasi Trailer (Trail Setup)**: Gabungkan kepala truk fisik dan trailernya. Visualisasi gabungan truk dikalkulasi secara *real-time* berbasis SVG.
- **Pelacakan & Siklus Hidup Ban (Tire Tracking)**: Kelola inventaris ban Anda secara unik. Lacak kedalaman tapak ban, kondisi, serta log pemasangan/pelepasan ban.
- **Peta Langsung Interaktif (Live Map)**: Pantau kendaraan aktif di atas peta Leaflet nyata menggunakan koordinat GPS.
- **Telemetri Dashboard**: Lihat ringkasan statistik yang indah menggunakan grafik Recharts (React) atau Chart.js (Vue).
- **Manajemen Akses & Identitas (IAM)**:
  - Role-Based Access Control (RBAC) atau kontrol akses berbasis peran yang sudah tergabung di dalam backend.
  - Izin (permissions) `view` (lihat) dan `manage` (kelola) yang sangat detail, disinkronkan secara otomatis dari struktur direktori backend.
  - Portal manajemen pengguna secara lengkap.
- **Estetika Premium**: Kedua frontend menggunakan UI dark-mode (mode gelap) beraksen *glassmorphism* yang ditenagai oleh TailwindCSS dan Shadcn UI.
- **Kesetaraan Antar-Framework (Cross-Framework)**: Aplikasi ini menyediakan versi React dan versi Vue 3 dari antarmuka pengguna, di mana keduanya identik secara visual dan fungsional.

---

## 🛠️ Tech Stack (Teknologi yang Digunakan)

### Backend (`/backend`)
- **Framework**: Node.js + Fastify
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Keamanan (Security)**: `@fastify/jwt`, `bcrypt`
- **Testing**: Vitest + Supertest 

### Frontend (React) (`/frontend`)
- **Framework**: React 18 + Vite
- **Routing**: React Router DOM (v6)
- **State Management**: Zustand
- **Pengambilan Data (Data Fetching)**: TanStack Query
- **Styling**: TailwindCSS + Shadcn UI + Framer Motion
- **Maps**: React-Leaflet

### Frontend (Vue) (`/frontend-vue`)
- **Framework**: Vue 3 (Composition API) + Vite
- **Routing**: Vue Router
- **State Management**: Pinia
- **Pengambilan Data (Data Fetching)**: TanStack Query (Vue Query)
- **Styling**: TailwindCSS + Shadcn Vue + Vue `<Transition>`
- **Maps**: Vue-Leaflet

---

## 📦 Memulai Instalasi (Getting Started)

### Prasyarat:
- [Docker](https://www.docker.com/) dan Docker Compose
- [Node.js](https://nodejs.org/en/) (v20+)
- Package manager [pnpm](https://pnpm.io/)

### 1. Menjalankan dengan Docker (Direkomendasikan)
Cara termudah untuk menyalakan seluruh sistem (Database, Backend, Frontend React, dan Frontend Vue) adalah menggunakan Docker Compose.

```bash
# Buka terminal di folder root (utama) repositori ini
docker compose up --build -d
```

Layanan-layanan tersebut akan tersedia pada:
- **Frontend React**: [http://localhost:5173](http://localhost:5173)
- **Frontend Vue**: [http://localhost:5174](http://localhost:5174)
- **Fastify Backend**: [http://localhost:3000](http://localhost:3000)

> Catatan: Saat pertama kali kontainer database (PostgreSQL) menyala, sistem akan menjalankan Prisma Migrations dan melakukan *seed* (mengisi) database dengan satu akun pengguna Super Admin.

*Login Bawaan (Default):*
- **Username**: `admin`
- **Password**: `admin123`

### 2. Menjalankan Secara Lokal (Development Mode)
Jika Anda ingin menjalankan aplikasi tanpa Docker untuk keperluan pengembangan aktif:

1. **Nyalakan Database**
   ```bash
   docker compose up postgres -d
   ```

2. **Nyalakan Backend**
   ```bash
   cd backend
   pnpm install
   pnpm dev
   ```

3. **Nyalakan Frontend (React atau Vue)**
   ```bash
   cd frontend # atau cd frontend-vue
   pnpm install
   pnpm dev
   ```

---

## 📚 Panduan Pengembangan (Development Guide)

Jika Anda adalah seorang pengembang (*developer*) yang ingin memperluas fitur aplikasi ini dengan menambahkan modul, rute, atau endpoint backend baru, silakan merujuk pada [Development Guide](./development_guide.md) (Panduan Pengembangan) terperinci kami.

---

## 📝 Lisensi
Hak Milik / Closed Source. All Rights Reserved.
