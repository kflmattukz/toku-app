import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatIDR } from "#/lib/utils";
import { getLaymanHealthDiagnosis, type ReportExportData } from "../lib/report-export";

interface ReportPdfDocumentProps {
  data: ReportExportData;
  includeTransactions?: boolean;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 28,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#171717",
    backgroundColor: "#ffffff",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1.5,
    borderBottomColor: "#171717",
    paddingBottom: 10,
    marginBottom: 12,
  },
  brandBadge: {
    backgroundColor: "#ea580c",
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  brandBadgeText: {
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  reportSubTitle: {
    fontSize: 8,
    color: "#737373",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  storeTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#171717",
  },
  storeMeta: {
    fontSize: 8,
    color: "#525252",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  periodLabel: {
    fontSize: 8,
    color: "#737373",
    marginBottom: 2,
  },
  periodBadge: {
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa",
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  periodBadgeText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#c2410c",
  },
  printDate: {
    fontSize: 7.5,
    color: "#a3a3a3",
    marginTop: 4,
  },

  // Health diagnosis box
  healthBox: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 8,
    marginBottom: 12,
  },
  healthBoxHealthy: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
  },
  healthBoxWarning: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  healthTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  healthTitleHealthy: {
    color: "#14532d",
  },
  healthTitleWarning: {
    color: "#78350f",
  },
  healthText: {
    fontSize: 8,
    lineHeight: 1.3,
    color: "#3f3f46",
  },

  // 4 metrics grid
  metricsGrid: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#fafafa",
    padding: 6,
  },
  metricCardProfit: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
  },
  metricLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#737373",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  metricLabelProfit: {
    color: "#15803d",
  },
  metricValue: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#171717",
  },
  metricValueProfit: {
    color: "#15803d",
  },
  metricValueExpense: {
    color: "#be123c",
  },
  metricSub: {
    fontSize: 6.5,
    color: "#737373",
    marginTop: 2,
  },
  metricSubProfit: {
    color: "#16a34a",
    fontFamily: "Helvetica-Bold",
  },

  // Section Table Card
  sectionCard: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    marginBottom: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 5,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#404040",
    textTransform: "uppercase",
  },
  sectionMeta: {
    fontSize: 7.5,
    color: "#737373",
  },

  // P&L Table Rows
  plRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
  },
  plRowAlt: {
    backgroundColor: "#fafafa",
  },
  plRowFinal: {
    backgroundColor: "#dcfce7",
    borderBottomWidth: 0,
    paddingVertical: 6,
  },
  plColDesc: {
    flex: 2.2,
    fontSize: 8,
    color: "#262626",
  },
  plColDescFinal: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#14532d",
  },
  plColValue: {
    flex: 1.3,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#171717",
  },
  plColValueFinal: {
    fontSize: 9.5,
    color: "#14532d",
  },
  plColValueExpense: {
    color: "#be123c",
  },
  plColValueGross: {
    color: "#c2410c",
  },
  plColNote: {
    flex: 2,
    textAlign: "right",
    fontSize: 7.5,
    color: "#737373",
  },
  plColNoteFinal: {
    color: "#15803d",
    fontFamily: "Helvetica-Bold",
  },

  // Data Tables
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#fafafa",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  thText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#737373",
    textTransform: "uppercase",
  },
  tdText: {
    fontSize: 7.5,
    color: "#262626",
  },
  tdTextBold: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#171717",
  },

  // Columns Widths for Products Table
  colProdNo: { width: "7%" },
  colProdName: { width: "38%" },
  colProdQty: { width: "13%", textAlign: "center" },
  colProdRev: { width: "14%", textAlign: "right" },
  colProdCost: { width: "14%", textAlign: "right" },
  colProdProfit: { width: "14%", textAlign: "right" },

  // Columns Widths for Transactions Table
  colTxNo: { width: "6%" },
  colTxTime: { width: "14%" },
  colTxCashier: { width: "14%" },
  colTxItems: { width: "42%" },
  colTxMethod: { width: "10%", textAlign: "center" },
  colTxTotal: { width: "14%", textAlign: "right" },

  // Footer
  pageFooter: {
    position: "absolute",
    bottom: 14,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#e5e5e5",
    paddingTop: 5,
  },
  footerText: {
    fontSize: 7,
    color: "#a3a3a3",
  },
});

export function ReportPdfDocument({ data, includeTransactions = true }: ReportPdfDocumentProps) {
  const diagnosis = getLaymanHealthDiagnosis(data.totalRevenue, data.netProfit, data.netMargin);
  const sortedProducts = [...(data.topProducts || [])].sort(
    (a, b) => b.totalRevenue - a.totalRevenue,
  );
  const printedAt = new Date().toLocaleString("id-ID");

  return (
    <Document title={`Laporan Keuangan Toku POS - ${data.storeName}`}>
      <Page size="A4" style={styles.page}>
        {/* Header Toko */}
        <View style={styles.header} wrap={false}>
          <View>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>Toku POS</Text>
            </View>
            <Text style={styles.reportSubTitle}>Laporan Keuangan & Laba Bersih</Text>
            <Text style={styles.storeTitle}>{data.storeName}</Text>
            {Boolean(data.storeAddress) && (
              <Text style={styles.storeMeta}>{data.storeAddress}</Text>
            )}
            {Boolean(data.storePhone) && (
              <Text style={styles.storeMeta}>Telp: {data.storePhone}</Text>
            )}
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.periodLabel}>Periode Laporan</Text>
            <View style={styles.periodBadge}>
              <Text style={styles.periodBadgeText}>{data.dateLabel}</Text>
            </View>
            <Text style={styles.printDate}>Waktu Cetak: {printedAt}</Text>
          </View>
        </View>

        {/* Diagnosa Kesehatan Bisnis */}
        <View
          style={[
            styles.healthBox,
            diagnosis.isHealthy ? styles.healthBoxHealthy : styles.healthBoxWarning,
          ]}
          wrap={false}
        >
          <Text
            style={[
              styles.healthTitle,
              diagnosis.isHealthy ? styles.healthTitleHealthy : styles.healthTitleWarning,
            ]}
          >
            {diagnosis.title}
          </Text>
          <Text style={styles.healthText}>{diagnosis.text}</Text>
        </View>

        {/* 4 Angka Kunci Ringkasan */}
        <View style={styles.metricsGrid} wrap={false}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Uang Masuk (Omset)</Text>
            <Text style={styles.metricValue}>{formatIDR(data.totalRevenue)}</Text>
            <Text style={styles.metricSub}>{data.totalTransactions} transaksi</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Modal Barang (HPP)</Text>
            <Text style={styles.metricValue}>{formatIDR(data.totalCogs)}</Text>
            <Text style={styles.metricSub}>{data.totalItems} pcs barang</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Biaya Operasional</Text>
            <Text style={[styles.metricValue, styles.metricValueExpense]}>
              {formatIDR(data.totalExpenses)}
            </Text>
            <Text style={styles.metricSub}>Listrik, sewa, gaji, dll</Text>
          </View>

          <View style={[styles.metricCard, styles.metricCardProfit]}>
            <Text style={[styles.metricLabel, styles.metricLabelProfit]}>Cuan Bersih Akhir</Text>
            <Text style={[styles.metricValue, styles.metricValueProfit]}>
              {formatIDR(data.netProfit)}
            </Text>
            <Text style={styles.metricSubProfit}>Margin {data.netMargin.toFixed(1)}%</Text>
          </View>
        </View>

        {/* Perjalanan Laba Rugi Sederhana */}
        <View style={styles.sectionCard} wrap={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Perjalanan Laba Rugi Toko (P&L)</Text>
            <Text style={styles.sectionMeta}>Rumus Sederhana</Text>
          </View>

          <View style={styles.plRow}>
            <Text style={styles.plColDesc}>1. Total Uang Masuk (Omset Penjualan)</Text>
            <Text style={styles.plColValue}>{formatIDR(data.totalRevenue)}</Text>
            <Text style={styles.plColNote}>Semua uang diterima</Text>
          </View>

          <View style={[styles.plRow, styles.plRowAlt]}>
            <Text style={styles.plColDesc}>2. Dikurangi: Modal Kulakan Barang (HPP)</Text>
            <Text style={styles.plColValue}>- {formatIDR(data.totalCogs)}</Text>
            <Text style={styles.plColNote}>Modal barang laku</Text>
          </View>

          <View style={styles.plRow}>
            <Text style={styles.plColDesc}>= Untung Kotor Toko (Gross Profit)</Text>
            <Text style={[styles.plColValue, styles.plColValueGross]}>
              {formatIDR(data.grossProfit)}
            </Text>
            <Text style={styles.plColNote}>Margin {data.grossMargin.toFixed(1)}%</Text>
          </View>

          <View style={[styles.plRow, styles.plRowAlt]}>
            <Text style={styles.plColDesc}>3. Dikurangi: Biaya Operasional Toko</Text>
            <Text style={[styles.plColValue, styles.plColValueExpense]}>
              - {formatIDR(data.totalExpenses)}
            </Text>
            <Text style={styles.plColNote}>Listrik, operasional, dll</Text>
          </View>

          <View style={[styles.plRow, styles.plRowFinal]}>
            <Text style={styles.plColDescFinal}>★ CUAN BERSIH AKHIR (Masuk Kantong)</Text>
            <Text style={[styles.plColValue, styles.plColValueFinal]}>
              {formatIDR(data.netProfit)}
            </Text>
            <Text style={styles.plColNoteFinal}>Margin Bersih {data.netMargin.toFixed(1)}%</Text>
          </View>
        </View>

        {/* Tabel Produk Terlaris & Paling Menguntungkan */}
        <View style={styles.sectionCard} wrap>
          <View style={styles.sectionHeader} wrap={false}>
            <Text style={styles.sectionTitle}>Produk Paling Laris & Menguntungkan</Text>
            <Text style={styles.sectionMeta}>Total {sortedProducts.length} Produk</Text>
          </View>

          <View style={styles.tableHeaderRow} wrap={false}>
            <Text style={[styles.thText, styles.colProdNo]}>No</Text>
            <Text style={[styles.thText, styles.colProdName]}>Nama Produk</Text>
            <Text style={[styles.thText, styles.colProdQty]}>Terjual</Text>
            <Text style={[styles.thText, styles.colProdRev]}>Total Omset</Text>
            <Text style={[styles.thText, styles.colProdCost]}>Total Modal</Text>
            <Text style={[styles.thText, styles.colProdProfit]}>Cuan Bersih</Text>
          </View>

          {sortedProducts.map((p, idx) => (
            <View
              key={p.name + idx}
              style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
              wrap={false}
            >
              <Text style={[styles.tdText, styles.colProdNo]}>{idx + 1}</Text>
              <Text style={[styles.tdTextBold, styles.colProdName]}>{p.name}</Text>
              <Text style={[styles.tdText, styles.colProdQty]}>{p.totalQty} pcs</Text>
              <Text style={[styles.tdText, styles.colProdRev]}>{formatIDR(p.totalRevenue)}</Text>
              <Text style={[styles.tdText, styles.colProdCost]}>{formatIDR(p.totalCost)}</Text>
              <Text
                style={[
                  styles.tdTextBold,
                  styles.colProdProfit,
                  { color: p.totalProfit >= 0 ? "#15803d" : "#be123c" },
                ]}
              >
                {formatIDR(p.totalProfit)}
              </Text>
            </View>
          ))}
        </View>

        {/* Tabel Transaksi Kasir (Jika dicentang) */}
        {includeTransactions && (data.transactions || []).length > 0 && (
          <View style={styles.sectionCard} wrap>
            <View style={styles.sectionHeader} wrap={false}>
              <Text style={styles.sectionTitle}>Buku Riwayat Transaksi Kasir</Text>
              <Text style={styles.sectionMeta}>{data.transactions.length} Transaksi Tercatat</Text>
            </View>

            <View style={styles.tableHeaderRow} wrap={false}>
              <Text style={[styles.thText, styles.colTxNo]}>No</Text>
              <Text style={[styles.thText, styles.colTxTime]}>Waktu</Text>
              <Text style={[styles.thText, styles.colTxCashier]}>Kasir</Text>
              <Text style={[styles.thText, styles.colTxItems]}>Item Terjual</Text>
              <Text style={[styles.thText, styles.colTxMethod]}>Metode</Text>
              <Text style={[styles.thText, styles.colTxTotal]}>Total</Text>
            </View>

            {data.transactions.map((tx: any, idx: number) => {
              const timeStr = tx.createdAt
                ? new Date(tx.createdAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-";
              const itemsSummary = (tx.items || [])
                .map((i: any) => `${i.name} (${i.qty}x)`)
                .join(", ");

              return (
                <View
                  key={tx._id || tx.invoiceNumber || idx}
                  style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
                  wrap={false}
                >
                  <Text style={[styles.tdText, styles.colTxNo]}>{idx + 1}</Text>
                  <Text style={[styles.tdText, styles.colTxTime]}>{timeStr}</Text>
                  <Text style={[styles.tdText, styles.colTxCashier]}>
                    {tx.cashierName || "Kasir"}
                  </Text>
                  <Text style={[styles.tdText, styles.colTxItems]}>{itemsSummary || "-"}</Text>
                  <Text style={[styles.tdText, styles.colTxMethod]}>
                    {(tx.paymentMethod || "CASH").toUpperCase()}
                  </Text>
                  <Text style={[styles.tdTextBold, styles.colTxTotal]}>{formatIDR(tx.total)}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Page Footer (Fixed across pages) */}
        <View style={styles.pageFooter} fixed>
          <Text style={styles.footerText}>
            Dicetak otomatis dari Toku POS · Dokumen Laporan Resmi {data.storeName}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
