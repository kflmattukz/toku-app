import { useState } from "react";
import { Modal } from "#/components/Modal";
import { formatIDRInput, parseIDRInput } from "#/lib/utils";
import {
  ReceiptIcon,
  CalendarBlankIcon,
  WalletIcon,
  TagIcon,
  NotePencilIcon,
} from "@phosphor-icons/react";
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
  type ExpenseSource,
  type ExpenseFormState,
} from "../types";

interface ExpenseFormModalProps {
  open: boolean;
  onClose: () => void;
  saving: boolean;
  onSave: (form: ExpenseFormState) => void;
  activeShift?: any;
}

export function ExpenseFormModal({
  open,
  onClose,
  saving,
  onSave,
  activeShift,
}: ExpenseFormModalProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  const [category, setCategory] = useState<ExpenseCategory>("operasional");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(todayStr);
  const [notes, setNotes] = useState<string>("");
  const [source, setSource] = useState<ExpenseSource>("cash_drawer");
  const [deductFromDrawer, setDeductFromDrawer] = useState<boolean>(true);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      category,
      amount,
      date,
      notes,
      source,
      deductFromDrawer: source === "cash_drawer" ? deductFromDrawer : false,
    });
  };

  return (
    <Modal onClose={onClose} maxWidth={500}>
      <div className="mb-4">
        <div className="eyebrow-tag mb-1">CATAT PENGELUARAN</div>
        <h2 className="text-xl font-black tracking-tight text-[var(--color-text)]">
          Catat Biaya & Beban Toko
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-2)]">
          Pencatatan pengeluaran agar laba bersih toko terhitung akurat.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Nominal Pengeluaran */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[var(--color-text)]">
            Nominal Biaya (IDR)
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-xs font-extrabold text-[var(--color-brand)]">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Contoh: 50.000"
              value={amount}
              onChange={(e) => setAmount(formatIDRInput(e.target.value))}
              required
              autoFocus
              className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3 pr-3.5 pl-10 text-base font-extrabold text-[var(--color-text)] focus:ring-2 focus:outline-none"
            />
          </div>
        </div>

        {/* Kategori Pengeluaran */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)]">
            <TagIcon size={14} weight="bold" />
            <span>Kategori Pengeluaran</span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {EXPENSE_CATEGORIES.map((cat) => {
              const active = category === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`press-tactile flex cursor-pointer items-center justify-center rounded-xl border p-2.5 text-xs font-bold transition-all ${
                    active
                      ? "border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)] shadow-xs"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)]"
                  }`}
                >
                  <span className="truncate text-center">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tanggal & Sumber Dana */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)]">
              <CalendarBlankIcon size={14} weight="bold" />
              <span>Tanggal</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-xs font-bold text-[var(--color-text)] focus:ring-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)]">
              <WalletIcon size={14} weight="bold" />
              <span>Sumber Dana</span>
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as ExpenseSource)}
              className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-xs font-bold text-[var(--color-text)] focus:ring-2 focus:outline-none"
            >
              <option value="cash_drawer">Laci Kasir (Cash)</option>
              <option value="bank">Rekening Bank / Transfer</option>
              <option value="owner">Modal / Kas Pribadi Owner</option>
            </select>
          </div>
        </div>

        {/* Keterangan / Catatan */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)]">
            <NotePencilIcon size={14} weight="bold" />
            <span>Keterangan / Keperluan</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Beli token listrik 100rb & plastik kresek"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-xs font-medium text-[var(--color-text)] focus:ring-2 focus:outline-none"
          />
        </div>

        {/* Info Laci Kasir Shift */}
        {source === "cash_drawer" && activeShift && (
          <div className="rounded-xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-light)] p-3 text-xs text-[var(--color-brand-dark)]">
            <div className="font-bold">💡 Kasir Shift Aktif Terdeteksi</div>
            <div className="mt-0.5 text-[11px] opacity-90">
              Pengeluaran tunai ini otomatis tercatat sebagai kas keluar pada shift kasir saat ini.
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="press-tactile flex-1 cursor-pointer rounded-full border border-border bg-surface-2 py-3 text-xs font-extrabold text-text transition-all hover:bg-surface-3"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving || parseIDRInput(amount) <= 0}
            className="press-tactile flex-1.5 cursor-pointer rounded-full bg-brand py-3 text-xs font-extrabold text-white shadow-md shadow-brand/25 transition-all hover:bg-brand-dark disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Pengeluaran"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
