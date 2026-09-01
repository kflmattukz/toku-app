import { useState } from "react";
import { Modal } from "#/components/Modal";
import { formatIDRInput, parseIDRInput } from "#/lib/utils";
import {
  CalendarBlankIcon,
  WalletIcon,
  TagIcon,
  NotePencilIcon,
  BankIcon,
  UserIcon,
  MoneyIcon,
} from "@phosphor-icons/react";
import { Select, Button, type SelectOption } from "#/components/ui";
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

const SOURCE_OPTIONS: SelectOption<ExpenseSource>[] = [
  {
    value: "cash_drawer",
    label: "Laci Kasir (Cash)",
    description: "Dipotong langsung dari kas laci kasir",
    icon: <MoneyIcon size={16} weight="duotone" className="text-emerald-600" />,
  },
  {
    value: "bank",
    label: "Rekening Bank / Transfer",
    description: "Transfer via rekening operasional toko",
    icon: <BankIcon size={16} weight="duotone" className="text-blue-600" />,
  },
  {
    value: "owner",
    label: "Modal / Kas Pribadi Owner",
    description: "Dana talangan / kas pribadi pemilik",
    icon: <UserIcon size={16} weight="duotone" className="text-amber-600" />,
  },
];

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

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseIDRInput(amount);
    if (!amountNum || amountNum <= 0) return;

    onSave({
      category,
      amount,
      date,
      notes,
      source,
      deductFromDrawer: source === "cash_drawer",
    });
  };

  return (
    <Modal onClose={onClose} maxWidth={500}>
      <div className="mb-4">
        <div className="eyebrow-tag mb-1">PENGELUARAN BARU</div>
        <h2 className="text-xl font-black tracking-tight text-[var(--color-text)]">
          Catat Pengeluaran Operasional
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Nominal Pengeluaran */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[var(--color-text)]">
            Nominal Pengeluaran (IDR)
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
            <Select<ExpenseSource>
              value={source}
              onChange={(val) => setSource(val)}
              options={SOURCE_OPTIONS}
              variant="form"
              size="md"
              placeholder="Pilih Sumber Dana"
            />
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
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            fullWidth
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={saving}
            loadingText="Menyimpan..."
            disabled={parseIDRInput(amount) <= 0}
          >
            Simpan Pengeluaran
          </Button>
        </div>
      </form>
    </Modal>
  );
}
