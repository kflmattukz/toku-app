import {
  WrenchIcon,
  ForkKnifeIcon,
  CoffeeIcon,
  ShoppingCartIcon,
  StorefrontIcon,
  DropIcon,
  ScissorsIcon,
  TShirtIcon,
  DeviceMobileIcon,
  PillIcon,
  HammerIcon,
  PawPrintIcon,
  PrinterIcon,
  TagIcon,
} from "@phosphor-icons/react";

export const UMKM_CATEGORIES = [
  {
    value: "bengkel",
    label: "Bengkel Motor & Mobil / Otomotif",
    desc: "Bengkel servis, suku cadang & ganti oli",
    icon: WrenchIcon,
  },
  {
    value: "kuliner_resto",
    label: "Kuliner & Restoran",
    desc: "Rumah makan, resto, kedai & kuliner",
    icon: ForkKnifeIcon,
  },
  {
    value: "warung_kopi",
    label: "Warung Kopi / Cafe",
    desc: "Kopi, minuman kekinian & nongkrong",
    icon: CoffeeIcon,
  },
  {
    value: "sembako",
    label: "Warung Sembako",
    desc: "Beras, minyak, bumbu & kebutuhan dapur",
    icon: ShoppingCartIcon,
  },
  {
    value: "kelontong",
    label: "Toko Kelontong",
    desc: "Kebutuhan rumah tangga & sembako harian",
    icon: StorefrontIcon,
  },
  {
    value: "laundry",
    label: "Laundry Kiloan & Satuan",
    desc: "Cuci kiloan, satuan, setrika & dry clean",
    icon: DropIcon,
  },
  {
    value: "barbershop_salon",
    label: "Barbershop, Pangkas Rambut & Salon",
    desc: "Pangkas rambut, potong rambut & grooming",
    icon: ScissorsIcon,
  },
  {
    value: "fashion_butik",
    label: "Pakaian, Fashion & Butik",
    desc: "Pakaian, hijab, sepatu & aksesoris mode",
    icon: TShirtIcon,
  },
  {
    value: "konter_pulsa",
    label: "Konter Pulsa & HP",
    desc: "Pulsa, paket data, voucher & aksesoris",
    icon: DeviceMobileIcon,
  },
  {
    value: "apotek",
    label: "Apotek & Toko Obat",
    desc: "Obat-obatan, resep & alat kesehatan",
    icon: PillIcon,
  },
  {
    value: "toko_bangunan",
    label: "Toko Bangunan & Material",
    desc: "Material bangunan, cat, semen & perkakas",
    icon: HammerIcon,
  },
  {
    value: "petshop",
    label: "Petshop & Klinik Hewan",
    desc: "Pakan hewan, vitamin, grooming & aksesoris",
    icon: PawPrintIcon,
  },
  {
    value: "atk_fotokopi",
    label: "ATK & Fotokopi / Percetakan",
    desc: "Alat tulis, fotokopi, print & percetakan",
    icon: PrinterIcon,
  },
  {
    value: "lainnya",
    label: "Usaha Lainnya",
    desc: "Kategori bisnis & usaha UMKM lainnya",
    icon: TagIcon,
  },
];

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  UMKM_CATEGORIES.map((c) => [c.value, c.label]),
);
