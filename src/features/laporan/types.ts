export type Range = "hari" | "minggu" | "bulan";

export type TopProduct = {
  name: string;
  totalQty: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
};

export type TrendBucket = {
  id: string;
  label: string;
  shortLabel: string;
  subLabel: string;
  revenue: number;
  cogs: number;
  profit: number;
  count: number;
};
