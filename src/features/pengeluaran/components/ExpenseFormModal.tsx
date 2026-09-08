import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
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
  WarningCircleIcon,
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

  const form = useForm({
    defaultValues: {
      category: "operasional" as ExpenseCategory,
      amount: "",
      date: todayStr,
      notes: "",
      source: "cash_drawer" as ExpenseSource,
    },
    onSubmit: async ({ value }) => {
      const amountNum = parseIDRInput(value.amount);
      if (!amountNum || amountNum <= 0) return;

      onSave({
        category: value.category,
        amount: value.amount,
        date: value.date,
        notes: value.notes,
        source: value.source,
        deductFromDrawer: value.source === "cash_drawer",
      });
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open]);

  if (!open) return null;

  return (
    <Modal onClose={onClose} maxWidth={500}>
      <div className="mb-4">
        <div className="eyebrow-tag mb-1">PENGELUARAN BARU</div>
        <h2 className="text-xl font-black tracking-tight text-[var(--color-text)]">
          Catat Pengeluaran Operasional
        </h2>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        noValidate
        className="flex flex-col gap-4"
      >
        {/* Nominal Pengeluaran */}
        <form.Field
          name="amount"
          validators={{
            onChange: ({ value }) => {
              if (!value || !value.trim()) return "Nominal pengeluaran wajib diisi";
              const num = parseIDRInput(value);
              if (!num || num <= 0) return "Nominal harus lebih dari Rp 0";
              return undefined;
            },
          }}
        >
          {(field) => {
            const error = field.state.meta.errors[0];
            return (
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
                    value={field.state.value}
                    onChange={(e) => field.handleChange(formatIDRInput(e.target.value))}
                    onBlur={field.handleBlur}
                    autoFocus
                    className={`w-full rounded-xl border bg-[var(--color-surface)] py-3 pr-3.5 pl-10 text-base font-extrabold text-[var(--color-text)] transition-colors focus:ring-2 focus:outline-none ${
                      error
                        ? "border-rose-500 bg-rose-500/5 focus:border-rose-500 focus:ring-rose-500/20"
                        : "border-[var(--color-border)] focus:border-primary-500 focus:ring-primary-500/20"
                    }`}
                  />
                </div>
                {error && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                    <WarningCircleIcon size={13} weight="fill" />
                    <span>{error}</span>
                  </p>
                )}
              </div>
            );
          }}
        </form.Field>

        {/* Kategori Pengeluaran */}
        <form.Field name="category">
          {(field) => (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)]">
                <TagIcon size={14} weight="bold" />
                <span>Kategori Pengeluaran</span>
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {EXPENSE_CATEGORIES.map((cat) => {
                  const active = field.state.value === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => field.handleChange(cat.key)}
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
          )}
        </form.Field>

        {/* Tanggal & Sumber Dana */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <form.Field name="date">
            {(field) => (
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)]">
                  <CalendarBlankIcon size={14} weight="bold" />
                  <span>Tanggal</span>
                </label>
                <input
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-xs font-bold text-[var(--color-text)] focus:ring-2 focus:outline-none"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="source">
            {(field) => (
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)]">
                  <WalletIcon size={14} weight="bold" />
                  <span>Sumber Dana</span>
                </label>
                <Select<ExpenseSource>
                  value={field.state.value}
                  onChange={(val) => field.handleChange(val)}
                  options={SOURCE_OPTIONS}
                  variant="form"
                  size="md"
                  placeholder="Pilih Sumber Dana"
                />
              </div>
            )}
          </form.Field>
        </div>

        {/* Keterangan / Catatan */}
        <form.Field name="notes">
          {(field) => (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)]">
                <NotePencilIcon size={14} weight="bold" />
                <span>Keterangan / Keperluan</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Beli token listrik 100rb & plastik kresek"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-xs font-medium text-[var(--color-text)] focus:ring-2 focus:outline-none"
              />
            </div>
          )}
        </form.Field>

        {/* Info Laci Kasir Shift */}
        <form.Subscribe
          selector={(state) => ({
            source: state.values.source,
            amount: state.values.amount,
            canSubmit: parseIDRInput(state.values.amount) > 0,
          })}
        >
          {({ source, canSubmit }) => (
            <>
              {source === "cash_drawer" && activeShift && (
                <div className="rounded-xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-light)] p-3 text-xs text-[var(--color-brand-dark)]">
                  <div className="font-bold">💡 Kasir Shift Aktif Terdeteksi</div>
                  <div className="mt-0.5 text-[11px] opacity-90">
                    Pengeluaran tunai ini otomatis tercatat sebagai kas keluar pada shift kasir saat
                    ini.
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
                  disabled={!canSubmit}
                >
                  Simpan Pengeluaran
                </Button>
              </div>
            </>
          )}
        </form.Subscribe>
      </form>
    </Modal>
  );
}
