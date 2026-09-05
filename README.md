# Toku POS — Kasir Digital Offline-First UMKM

![Toku POS Hero Banner](./public/toku_pos_hero_banner.png)

> **Toku POS** adalah aplikasi Kasir Digital (Point of Sale) modern, super cepat, dan **Offline-First** yang dirancang khusus untuk memenuhi kebutuhan pemilik usaha UMKM (Usaha Mikro, Kecil, dan Menengah) di Makassar & Indonesia.

---

## 🎯 Target Pengguna (Who is this for?)

Toku POS dibuat khusus untuk pemilik warung dan toko kelontong harian yang ingin menggantikan pencatatan manual di buku dengan kasir digital modern tanpa tergantung koneksi internet:

- 🏪 **Warung Sembako & Toko Kelontong**: Penjualan bahan makanan, beras, minyak, dan kebutuhan dapur harian.
- ☕ **Warung Kopi (Warkop) & Cafe**: Pemesanan kopi, minuman, dan snack cepat saji.
- 💊 **Apotek & Toko Obat**: Manajemen stok obat-obatan, vitamin, dan alat kesehatan.
- 📱 **Konter Pulsa & Aksesoris HP**: Penjualan pulsa, paket data, charger, dan kartu perdana.
- 🍲 **Usaha Kuliner & Rumah Makan**: Catatan transaksi meja & makanan cepat saji.

---

## ✨ Fitur Unggulan

- ⚡ **Mode Offline-First**: Tetap dapat berjualan saat internet mati atau sinyal lemah. Semua transaksi disimpan secara otomatis di memori lokal (IndexedDB) dan disinkronkan ke server saat koneksi pulih.
- 📷 **Scanner Barcode & QR Kamera (Continuous & Single Scan)**: Pindai barcode fisik produk langsung menggunakan kamera smartphone atau webcam tanpa hardware scanner eksternal. Mendukung mode continuous di kasir (otomatis masuk keranjang berturut-turut), nada beep sintetis Web Audio API (100% offline & zero-lag), getar haptik, animasi laser, kontrol senter (torch), dan switch kamera.
- 📸 **Upload Foto Produk & Live Preview**: Dukungan kompresi gambar berbasis canvas di browser untuk menambahkan foto katalog produk tanpa memperlambat aplikasi.
- 🟧 **Desain System Dribbble Terracotta & Soft Ivory**: Tampilan visual agency-tier $150k dengan tombol kapsul melayang (_floating capsule dock_), squircle card double-bezel, dan micro-interaction taktil yang responsif.
- 🧾 **Struk Thermal Bluetooth / USB**: Format cetak struk nota 80mm langsung dari browser tanpa perlu driver tambahan.
- 📊 **Laporan Penjualan & Leaderboard Produk**: Pantau total omset harian, jumlah transaksi, dan produk terlaris secara real-time.
- 🔢 **Format Harga Otomatis & Stepper Kuantitas**: Format harga ribuan (IDR) otomatis saat diketik dan stepper jumlah barang (`-` / `+`) langsung di kartu produk.

---

## 📖 Panduan 4 Langkah Penggunaan Toku POS

![Toku POS Workflow User Guide](./public/toku_pos_workflow_guide.png)

### 1️⃣ Langkah 1: Login & Atur Profil Toko

- Masuk ke aplikasi menggunakan akun **Google**.
- Pada layar onboarding, isi **Nama Toko** (contoh: _Warung Bu Ani_) dan pilih **Jenis Usaha / Kategori**.

### 2️⃣ Langkah 2: Kelola Katalog Produk & Foto

- Masuk ke menu **Produk** → Klik **Tambah Produk Baru**.
- Isikan nama barang, harga jual, dan jumlah stok awal.
- Pindai barcode kemasan barang dengan menekan tombol **Scan** di samping kolom Barcode/SKU.
- Upload **Foto Produk** (JPG/PNG). Foto akan dikompresi otomatis dan langsung menampilkan live preview.

### 3️⃣ Langkah 3: Transaksi Kasir & Pembayaran

- Masuk ke menu **Kasir**.
- Pindai barang langsung menggunakan tombol **Scan Barcode** di header atau search bar untuk memasukkan produk ke keranjang secara instan (mendukung multi-scan beruntun dengan bunyi beep konfirmasi).
- Atau cari barang menggunakan **Pill Search Bar** (dukung pencarian nama & barcode) atau filter **Kategori**.
- Tekan tombol **Pilih** atau atur jumlah stepper `+` di kartu produk.
- Buka **Rincian Belanja**, pilih metode pembayaran **Tunai (Cash)** dengan kalkulator kembalian otomatis atau **QRIS Digital**, lalu tekan **Selesaikan Pembayaran**.

### 4️⃣ Langkah 4: Cetak Struk & Cek Laporan Harian

- Setelah pembayaran selesai, modal **Struk Thermal** akan muncul. Klik **Cetak Struk** untuk mencetak ke printer thermal 80mm.
- Buka menu **Laporan** untuk melihat ringkasan omset harian dan grafik barang paling laku.

---

## 🛠️ Teknologi & Arsitektur Stack

- **Frontend**: React 19, [TanStack React Start](https://tanstack.com/start), [TanStack Router](https://tanstack.com/router)
- **Styling & Fonts**: CSS Variables Native, Plus Jakarta Sans, JetBrains Mono (Tabular Price Numerals), `@phosphor-icons/react`
- **Barcode & Hardware Engine**: `html5-qrcode`, Web Audio API (Synth Feedback), Web Vibration API (Haptics)
- **Backend Database & Realtime Functions**: [Convex Cloud Database](https://convex.dev)
- **Autentikasi**: Better-Auth + Google OAuth 2.0
- **Offline Storage & Queue**: IndexedDB / LocalStorage queue processor

---

## 🚀 Memulai Pembangunan Lokal (Local Development)

### Prasyarat

- Node.js v18+
- `pnpm` v9+

### 1. Clone Repository & Install Dependensi

```bash
git clone https://github.com/username/toku-pos.git
cd toku-pos
pnpm install
```

### 2. Konfigurasi Environment Variables (`.env`)

Buat file `.env` di root project dan sesuaikan URL Convex & Google Credentials:

```env
CONVEX_DEPLOYMENT=dev:sensible-quail-336
VITE_CONVEX_URL=https://sensible-quail-336.convex.cloud
VITE_CONVEX_SITE_URL=https://sensible-quail-336.convex.site

BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_generated_auth_secret

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Jalankan Backend Convex & Frontend Server

Jalankan backend Convex dev server:

```bash
npx convex dev
```

Di terminal kedua, jalankan dev server Vite:

```bash
pnpm dev
```

Buka browser di `http://localhost:3000`.

---

## 📦 Production Deployment

### 1. Deploy Convex Backend

```bash
npx convex deploy
```

### 2. Deploy Frontend ke Vercel

```bash
npx vercel
```

Atau hubungkan repository GitHub ke **Vercel / Netlify** dan tambahkan Environment Variables sesuai `.env`.

---

## 📄 Lisensi

Dibuat dengan ❤️ untuk kemajuan UMKM Makassar & Indonesia. Hak Cipta © 2025 Toku POS.
