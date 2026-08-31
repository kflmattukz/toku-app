import {
  ShoppingCartIcon,
  CoffeeIcon,
  PillIcon,
  DeviceMobileIcon,
  StorefrontIcon,
  PlusIcon,
  WrenchIcon,
  ScissorsIcon,
  ForkKnifeIcon,
  TShirtIcon,
  HammerIcon,
  PawPrintIcon,
  PrinterIcon,
  DropIcon,
} from "@phosphor-icons/react";

export const ONBOARDING_CATEGORIES = [
  {
    value: "bengkel",
    icon: WrenchIcon,
    label: "Bengkel & Otomotif",
    desc: "Bengkel motor, mobil, suku cadang & servis",
  },
  {
    value: "kuliner_resto",
    icon: ForkKnifeIcon,
    label: "Kuliner & Restoran",
    desc: "Rumah makan, resto, kedai & kuliner",
  },
  {
    value: "warung_kopi",
    icon: CoffeeIcon,
    label: "Warung Kopi / Cafe",
    desc: "Kopi, minuman kekinian & nongkrong",
  },
  {
    value: "sembako",
    icon: ShoppingCartIcon,
    label: "Warung Sembako",
    desc: "Beras, minyak, bumbu & kebutuhan dapur",
  },
  {
    value: "kelontong",
    icon: StorefrontIcon,
    label: "Toko Kelontong",
    desc: "Kebutuhan rumah tangga & sembako harian",
  },
  {
    value: "laundry",
    icon: DropIcon,
    label: "Laundry Kiloan",
    desc: "Cuci kiloan, satuan, setrika & dry clean",
  },
  {
    value: "barbershop_salon",
    icon: ScissorsIcon,
    label: "Barbershop & Salon",
    desc: "Pangkas rambut, potong rambut & perawatan",
  },
  {
    value: "fashion_butik",
    icon: TShirtIcon,
    label: "Fashion & Butik",
    desc: "Pakaian, hijab, sepatu & aksesoris mode",
  },
  {
    value: "konter_pulsa",
    icon: DeviceMobileIcon,
    label: "Konter Pulsa & HP",
    desc: "Pulsa, paket data, voucher & aksesoris",
  },
  {
    value: "apotek",
    icon: PillIcon,
    label: "Apotek & Toko Obat",
    desc: "Obat-obatan, resep & alat kesehatan",
  },
  {
    value: "toko_bangunan",
    icon: HammerIcon,
    label: "Toko Bangunan",
    desc: "Material bangunan, cat, semen & perkakas",
  },
  {
    value: "petshop",
    icon: PawPrintIcon,
    label: "Petshop & Klinik",
    desc: "Pakan hewan, vitamin, grooming & aksesoris",
  },
  {
    value: "atk_fotokopi",
    icon: PrinterIcon,
    label: "ATK & Fotokopi",
    desc: "Alat tulis, fotokopi, print & percetakan",
  },
  {
    value: "lainnya",
    icon: PlusIcon,
    label: "Usaha Lainnya",
    desc: "Kategori bisnis & usaha UMKM lainnya",
  },
] as const;

export type OnboardingCategory = (typeof ONBOARDING_CATEGORIES)[number]["value"];
