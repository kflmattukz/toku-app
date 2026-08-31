export function OnboardingHeader() {
  return (
    <div className="mb-8 text-center">
      <img
        src="/logo.png"
        alt="Toku POS"
        className="mx-auto mb-4 h-16 w-16 rounded-2xl object-contain shadow-sm"
      />
      <div className="eyebrow-tag mb-1 justify-center">ATUR TOKO KASIR</div>
      <h1 className="m-0 mb-1.5 text-2xl font-black tracking-tight text-[var(--color-text)]">
        Buat Profil Tokomu
      </h1>
      <p className="m-0 text-xs font-medium text-[var(--color-text-2)]">
        Hanya butuh 1 menit. Dapat diubah kapan saja di Pengaturan.
      </p>
    </div>
  );
}
