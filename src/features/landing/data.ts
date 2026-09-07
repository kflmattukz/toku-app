import {
  ChartBarIcon,
  CoffeeIcon,
  CreditCardIcon,
  DeviceMobileIcon,
  GoogleLogoIcon,
  LightningIcon,
  PackageIcon,
  PillIcon,
  PlusIcon,
  PrinterIcon,
  ShoppingCartIcon,
  StorefrontIcon,
  WifiHighIcon,
  type Icon,
} from "@phosphor-icons/react";

export interface FeatureItem {
  icon: Icon;
  title: string;
  desc: string;
  badge?: string;
}

export interface CategoryItem {
  icon: Icon;
  label: string;
  badge?: string;
}

export interface StepItem {
  step: string;
  title: string;
  desc: string;
  icon: Icon;
}

export interface ComparisonItem {
  feature: string;
  oldWay: string;
  tokuWay: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface SimulatorItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  isLowStock?: boolean;
}

export const FEATURES: FeatureItem[] = [
  {
    icon: LightningIcon,
    title: "Kasir Super Cepat",
    desc: "Proses transaksi tunai & QRIS dalam hitungan detik. Tanpa loading bertele-tele.",
    badge: "< 1 Detik",
  },
  {
    icon: PackageIcon,
    title: "Stok Terintegrasi",
    desc: "Stok berkurang otomatis setiap ada transaksi. Alert visual saat stok tersisa sedikit.",
    badge: "Otomatis",
  },
  {
    icon: ChartBarIcon,
    title: "Laporan Real-Time",
    desc: "Pantau total omset, transaksi, dan barang terlaris hari ini secara otomatis.",
    badge: "Live Rekap",
  },
  {
    icon: WifiHighIcon,
    title: "Mode Offline-First",
    desc: "Tetap jualan saat koneksi internet mati. Transaksi otomatis tersimpan dan disinkron.",
    badge: "Tanpa Kuota",
  },
  {
    icon: PrinterIcon,
    title: "Cetak Struk Thermal",
    desc: "Cetak nota transaksi langsung ke printer thermal Bluetooth/USB 58mm/80mm via browser.",
    badge: "58mm / 80mm",
  },
  {
    icon: CreditCardIcon,
    title: "Pembayaran QRIS & Tunai",
    desc: "Hitung kembalian otomatis untuk uang pas/pecahan, serta dukungan QRIS digital.",
    badge: "Multi-Metode",
  },
];

export const CATEGORIES: CategoryItem[] = [
  { icon: ShoppingCartIcon, label: "Warung Sembako", badge: "Populer" },
  { icon: CoffeeIcon, label: "Warung Kopi & Cafe" },
  { icon: PillIcon, label: "Apotek & Toko Obat" },
  { icon: DeviceMobileIcon, label: "Konter Pulsa & Aksesoris" },
  { icon: StorefrontIcon, label: "Toko Kelontong" },
  { icon: PlusIcon, label: "Usaha UMKM Lainnya" },
];

export const STEPS: StepItem[] = [
  {
    step: "01",
    title: "Masuk dengan Google",
    desc: "Hanya butuh 5 detik tanpa perlu pusing buat kata sandi baru.",
    icon: GoogleLogoIcon,
  },
  {
    step: "02",
    title: "Atur Nama Toko & Produk",
    desc: "Masukkan nama warungmu dan atur harga & foto barang jualan.",
    icon: StorefrontIcon,
  },
  {
    step: "03",
    title: "Mulai Kasir & Cetak Struk",
    desc: "Pilih barang, hitung kembalian otomatis, dan cetak nota kasir.",
    icon: LightningIcon,
  },
];

export const COMPARISONS: ComparisonItem[] = [
  {
    feature: "Koneksi Internet Mati",
    oldWay: "Penjualan terhenti / tulis manual",
    tokuWay: "Mode Offline-First aktif otomatis",
  },
  {
    feature: "Perhitungan Kembalian",
    oldWay: "Rawan salah hitung uang pas",
    tokuWay: "Hitung cepat otomatis 100% akurat",
  },
  {
    feature: "Pencatatan Stok Barang",
    oldWay: "Sering lupa atau stok selisih",
    tokuWay: "Stok berkurang otomatis & ada warning",
  },
  {
    feature: "Cetak Nota Transaksi",
    oldWay: "Tulis nota kertas satu per satu",
    tokuWay: "Cetak thermal 80mm instan 1 detik",
  },
  {
    feature: "Laporan Rekap Omset",
    oldWay: "Hitung manual di akhir hari",
    tokuWay: "Laporan real-time harian & bulanan",
  },
];

export const FAQS: FaqItem[] = [
  {
    q: "Apakah Toku POS bisa digunakan saat internet mati (offline)?",
    a: "Ya! Toku POS dirancang dengan arsitektur Offline-First. Kamu tetap bisa melayani transaksi kasir tanpa koneksi internet. Semua data transaksi tersimpan aman di memori HP/Tablet dan otomatis disinkronkan ke server cloud saat internet terhubung kembali.",
  },
  {
    q: "Apakah saya harus membayar biaya langganan?",
    a: "Tidak! Toku POS 100% Gratis digunakan untuk seluruh pelaku UMKM dan pemilik toko.",
  },
  {
    q: "Printer apa saja yang didukung untuk cetak struk?",
    a: "Toku POS mendukung semua printer thermal Bluetooth, USB, maupun WiFi dengan ukuran kertas standard 58mm dan 80mm langsung dari browser tanpa aplikasi tambahan.",
  },
  {
    q: "Di perangkat apa saja Toku POS bisa dibuka?",
    a: "Toku POS dapat diakses dari smartphone Android, iPhone, Tablet, iPad, Laptop, hingga Komputer kasir lewat browser tanpa perlu mengunduh installer dari PlayStore/AppStore.",
  },
];

export const SIMULATOR_ITEMS: SimulatorItem[] = [
  {
    id: "beras",
    name: "Beras Premium 5kg",
    price: 65000,
    stock: 12,
    category: "Sembako",
  },
  {
    id: "minyak",
    name: "Minyak Goreng 2L",
    price: 34000,
    stock: 8,
    category: "Sembako",
  },
  {
    id: "kopi",
    name: "Kopi Toraja 250g",
    price: 18000,
    stock: 20,
    category: "Minuman",
  },
  {
    id: "gula",
    name: "Gula Pasir 1kg",
    price: 16500,
    stock: 3,
    category: "Sembako",
    isLowStock: true,
  },
];
