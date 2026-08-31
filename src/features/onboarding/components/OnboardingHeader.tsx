export function OnboardingHeader() {
  return (
    <div className="text-center mb-8">
      <img
        src="/logo.png"
        alt="Toku POS"
        className="w-16 h-16 rounded-2xl object-contain mx-auto mb-4 shadow-sm"
      />
      <div className="eyebrow-tag justify-center mb-1">ATUR TOKO KASIR</div>
      <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight m-0 mb-1.5">
        Buat Profil Tokomu
      </h1>
      <p className="text-xs text-[var(--color-text-2)] m-0 font-medium">
        Hanya butuh 1 menit. Dapat diubah kapan saja di Pengaturan.
      </p>
    </div>
  );
}
