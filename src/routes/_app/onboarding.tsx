import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { authClient } from "#/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRightIcon } from "@phosphor-icons/react";
import {
  OnboardingHeader,
  BusinessCategoryGrid,
  type OnboardingCategory,
} from "#/features/onboarding";

export const Route = createFileRoute("/_app/onboarding")({ component: Onboarding });

function Onboarding() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const createStore = useMutation(api.stores.create);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<OnboardingCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category || !session) return;
    setSaving(true);
    setError("");
    try {
      const newStoreId = await createStore({
        userId: session.user.id,
        userEmail: session.user.email || undefined,
        name: name.trim(),
        category,
      });
      if (newStoreId) {
        const userKey = `toku_active_store_id_${session.user.email || session.user.id}`;
        localStorage.setItem(userKey, newStoreId as string);
        localStorage.setItem("toku_active_store_id", newStoreId as string);
      }
      toast.success(`Toko "${name.trim()}" berhasil dibuat!`, {
        description: "Selamat datang di Toku POS",
      });
      navigate({ to: "/kasir" });
    } catch {
      setError("Gagal menyimpan toko. Silakan coba lagi.");
      toast.error("Gagal membuat toko. Silakan periksa koneksi.");
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-2)] p-4 sm:p-8">
      <div className="w-full max-w-xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl sm:p-8">
        <OnboardingHeader />

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Store Name Input */}
          <div>
            <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
              Nama Toko / Usaha
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Warung Bu Ani, Toko Berkah..."
              required
              className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-semibold text-[var(--color-text)] focus:ring-2 focus:outline-none"
            />
          </div>

          {/* Business Category Grid */}
          <div>
            <label className="mb-2.5 block text-xs font-bold text-[var(--color-text)]">
              Pilih Jenis Usaha / Toko
            </label>
            <BusinessCategoryGrid selectedCategory={category} onSelectCategory={setCategory} />
          </div>

          {error && <p className="m-0 text-center text-xs font-bold text-rose-600">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving || !name.trim() || !category}
            className="press-tactile shadow-primary-500/25 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--color-brand)] px-6 py-3.5 text-xs font-extrabold text-white shadow-lg disabled:opacity-50"
          >
            <span>{saving ? "Menyiapkan Toko..." : "Mulai Gunakan Toku POS"}</span>
            <ArrowRightIcon size={16} weight="bold" />
          </button>
        </form>
      </div>
    </div>
  );
}
