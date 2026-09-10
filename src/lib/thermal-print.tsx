import { Fragment } from "react";
import { Printer, Text, Row, Line, Cut, render } from "react-thermal-printer";
import { formatIDR, calculateItemDiscount } from "./utils";

export interface ThermalReceiptProps {
  tx: any;
  storeName: string;
  storeAddress?: string;
  paperWidth?: "58mm" | "80mm";
}

/**
 * Creates and compiles a react-thermal-printer document into raw ESC/POS Uint8Array
 */
export async function renderThermalReceipt({
  tx,
  storeName,
  storeAddress,
  paperWidth = "80mm",
}: ThermalReceiptProps): Promise<Uint8Array> {
  const is58mm = paperWidth === "58mm";
  const colWidth = is58mm ? 32 : 48;

  const now = new Date(tx.createdAt || Date.now());
  const txId = tx._id
    ? `TX-${String(tx._id).slice(-6).toUpperCase()}`
    : `TX-${now.getTime().toString().slice(-6)}`;

  const items = Array.isArray(tx.items) ? tx.items : [];

  const receipt = (
    <Printer type="epson" width={colWidth} initialize={true}>
      {/* Header */}
      <Text align="center" size={{ width: 2, height: 2 }} bold>
        {storeName}
      </Text>
      {storeAddress ? <Text align="center">{storeAddress}</Text> : null}
      <Text align="center">
        {`${now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`}
      </Text>
      {tx.cashierName ? <Text align="center">{`Kasir: ${tx.cashierName}`}</Text> : null}
      <Text align="center" bold>
        {`#${txId}`}
      </Text>
      <Line character="-" />

      {/* Item List */}
      {items.map((item: any, idx: number) => {
        const disc = calculateItemDiscount(item.price, item.discountType, item.discountValue);
        const itemTotal = item.subtotal ?? disc.unitPrice * item.qty;
        let qtyDesc = `  ${item.qty} x ${formatIDR(item.price)}`;
        if (disc.hasDiscount) {
          qtyDesc += ` (Disc ${disc.discountLabel})`;
        }

        return (
          <Fragment key={idx}>
            <Row left={item.name} right={formatIDR(itemTotal)} />
            <Text>{qtyDesc}</Text>
          </Fragment>
        );
      })}

      <Line character="-" />

      {/* Subtotal & Discounts */}
      {tx.subtotal && tx.subtotal !== tx.total ? (
        <Row left="Subtotal" right={formatIDR(tx.subtotal)} />
      ) : null}

      {tx.discountAmount && tx.discountAmount > 0 ? (
        <Row
          left={`Diskon ${tx.discountType === "percentage" ? `(${tx.discountValue}%)` : ""}`}
          right={`-${formatIDR(tx.discountAmount)}`}
        />
      ) : null}

      {/* Payment Info */}
      <Row left="Metode Bayar" right={tx.paymentMethod === "cash" ? "Tunai" : "QRIS"} />

      {tx.paymentMethod === "cash" ? (
        <Row left="Uang Diterima" right={formatIDR(tx.cashPaid || tx.total)} />
      ) : null}

      {tx.paymentMethod === "cash" && tx.change !== undefined ? (
        <Row left="Kembalian" right={formatIDR(tx.change || 0)} />
      ) : null}

      <Line character="=" />

      {/* Grand Total */}
      <Text align="center" size={{ width: 2, height: 2 }} bold>
        {`TOTAL: ${formatIDR(tx.total)}`}
      </Text>
      <Line character="=" />

      {/* Footer */}
      <Text align="center">Terima kasih atas kunjungan Anda!</Text>
      <Text align="center" bold>
        Toku POS · Kasir Digital UMKM
      </Text>
      <Text align="center"> </Text>

      {/* Cut Paper */}
      <Cut lineFeeds={4} />
    </Printer>
  );

  return await render(receipt);
}

/** Check if Web Bluetooth API is available */
export function isBluetoothSupported(): boolean {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}

/** Check if Web Serial API is available */
export function isSerialSupported(): boolean {
  return typeof navigator !== "undefined" && "serial" in navigator;
}

/** Common Bluetooth GATT Printer Services */
const KNOWN_PRINTER_SERVICES = [
  "000018f0-0000-1000-8000-00805f9b34fb", // Common 58mm/80mm mini printer service
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2", // ESC/POS service
  "49535343-fe7d-4ae5-8fa9-9fafd205e455", // ISSC transparent service
  0xff00,
  0xff02,
];

/**
 * Sends ESC/POS binary data to a thermal printer via Web Bluetooth
 */
export async function printViaBluetooth(data: Uint8Array): Promise<void> {
  if (!isBluetoothSupported()) {
    throw new Error(
      "Web Bluetooth tidak didukung pada browser ini. Gunakan Google Chrome atau Microsoft Edge.",
    );
  }

  // Request device with printer service filters or acceptAllDevices
  const device = await (navigator as any).bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: KNOWN_PRINTER_SERVICES,
  });

  if (!device.gatt) {
    throw new Error("GATT server printer tidak tersedia.");
  }

  const server = await device.gatt.connect();

  let targetChar: any = null;

  // Search services for a writable characteristic
  const services = await server.getPrimaryServices();
  for (const service of services) {
    const characteristics = await service.getCharacteristics();
    for (const char of characteristics) {
      if (char.properties.write || char.properties.writeWithoutResponse) {
        targetChar = char;
        break;
      }
    }
    if (targetChar) break;
  }

  if (!targetChar) {
    throw new Error("Karakteristik penulisan (write) printer Bluetooth tidak ditemukan.");
  }

  // Send data in chunks of 128 bytes to prevent Bluetooth buffer overflow
  const chunkSize = 128;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    if (targetChar.properties.writeWithoutResponse) {
      await targetChar.writeValueWithoutResponse(chunk);
    } else {
      await targetChar.writeValue(chunk);
    }
    // Small delay to allow printer microcontroller buffer processing
    await new Promise((r) => setTimeout(r, 20));
  }

  // Disconnect after printing completes
  setTimeout(() => {
    try {
      device.gatt.disconnect();
    } catch {
      // ignore
    }
  }, 1000);
}

/**
 * Sends ESC/POS binary data to a thermal printer via Web Serial (USB)
 */
export async function printViaSerial(data: Uint8Array, baudRate = 9600): Promise<void> {
  if (!isSerialSupported()) {
    throw new Error(
      "Web Serial tidak didukung pada browser ini. Gunakan Google Chrome atau Microsoft Edge pada komputer/laptop.",
    );
  }

  const port = await (navigator as any).serial.requestPort();
  await port.open({ baudRate });

  const writer = port.writable.getWriter();
  try {
    await writer.write(data);
  } finally {
    writer.releaseLock();
    await port.close();
  }
}

/**
 * Download raw .bin ESC/POS file as universal fallback
 */
export function downloadReceiptBin(data: Uint8Array, filename = "struk.bin"): void {
  const blob = new Blob([data as unknown as BlobPart], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
