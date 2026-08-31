export type Range = "hari" | "minggu" | "bulan";

export type TopProduct = {
  name: string;
  totalQty: number;
  totalRevenue: number;
};

export type TrendBucket = {
  id: string;
  label: string;
  shortLabel: string;
  subLabel: string;
  revenue: number;
  count: number;
};
