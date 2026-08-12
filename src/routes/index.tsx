import { createFileRoute, Link } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import { useState, useEffect } from 'react'
import { isDarkMode, toggleTheme, formatIDR } from '#/lib/utils'
import {
  LightningIcon,
  PackageIcon,
  ChartBarIcon,
  WifiHighIcon,
  PrinterIcon,
  CreditCardIcon,
  ShoppingCartIcon,
  CoffeeIcon,
  PillIcon,
  DeviceMobileIcon,
  StorefrontIcon,
  PlusIcon,
  ArrowRightIcon,
  GoogleLogoIcon,
  SunIcon,
  MoonIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionIcon,
  CaretDownIcon,
  CaretUpIcon,
  SparkleIcon,
  QrCodeIcon,
  MoneyIcon,
  ShieldCheckIcon,
} from '@phosphor-icons/react'

export const Route = createFileRoute('/')({ component: Landing })

const FEATURES = [
  { icon: LightningIcon, title: 'Kasir Super Cepat', desc: 'Proses transaksi tunai & QRIS dalam hitungan detik. Tanpa loading bertele-tele.' },
  { icon: PackageIcon, title: 'Stok Terintegrasi', desc: 'Stok berkurang otomatis setiap ada transaksi. Alert visual saat stok tersisa sedikit.' },
  { icon: ChartBarIcon, title: 'Laporan Real-Time', desc: 'Pantau total omset, transaksi, dan barang terlaris hari ini secara otomatis.' },
  { icon: WifiHighIcon, title: 'Mode Offline-First', desc: 'Tetap jualan saat koneksi internet mati. Transaksi otomatis tersimpan dan disinkron.' },
  { icon: PrinterIcon, title: 'Cetak Struk Thermal', desc: 'Cetak nota transaksi langsung ke printer thermal Bluetooth/USB 58mm/80mm via browser.' },
  { icon: CreditCardIcon, title: 'Pembayaran QRIS & Tunai', desc: 'Hitung kembalian otomatis untuk uang pas/pecahan, serta dukungan QRIS digital.' },
]

const CATEGORIES = [
  { icon: ShoppingCartIcon, label: 'Warung Sembako' },
  { icon: CoffeeIcon, label: 'Warung Kopi & Cafe' },
  { icon: PillIcon, label: 'Apotek & Toko Obat' },
  { icon: DeviceMobileIcon, label: 'Konter Pulsa & Aksesoris' },
  { icon: StorefrontIcon, label: 'Toko Kelontong' },
  { icon: PlusIcon, label: 'Usaha UMKM Lainnya' },
]

const STEPS = [
  {
    step: '01',
    title: 'Masuk dengan Google',
    desc: 'Hanya butuh 5 detik tanpa perlu pusing buat kata sandi baru.',
    icon: GoogleLogoIcon,
  },
  {
    step: '02',
    title: 'Atur Nama Toko & Produk',
    desc: 'Masukkan nama warungmu dan atur harga & foto barang jualan.',
    icon: StorefrontIcon,
  },
  {
    step: '03',
    title: 'Mulai Kasir & Cetak Struk',
    desc: 'Pilih barang, hitung kembalian otomatis, dan cetak nota kasir.',
    icon: LightningIcon,
  },
]

const COMPARISONS = [
  { feature: 'Koneksi Internet Mati', oldWay: 'Penjualan terhenti / tulis manual', tokuWay: 'Mode Offline-First aktif otomatis' },
  { feature: 'Perhitungan Kembalian', oldWay: 'Rawan salah hitung uang pas', tokuWay: 'Hitung cepat otomatis 100% akurat' },
  { feature: 'Pencatatan Stok Barang', oldWay: 'Sering lupa atau stok selisih', tokuWay: 'Stok berkurang otomatis & ada warning' },
  { feature: 'Cetak Nota Transaksi', oldWay: 'Tulis nota kertas satu per satu', tokuWay: 'Cetak thermal 80mm instan 1 detik' },
  { feature: 'Laporan Rekap Omset', oldWay: 'Hitung manual di akhir hari', tokuWay: 'Laporan real-time harian & bulanan' },
]

const FAQS = [
  {
    q: 'Apakah Toku POS bisa digunakan saat internet mati (offline)?',
    a: 'Ya! Toku POS dirancang dengan arsitektur Offline-First. Kamu tetap bisa melayani transaksi kasir tanpa koneksi internet. Semua data transaksi tersimpan aman di memori HP/Tablet dan otomatis disinkronkan ke server cloud saat internet terhubung kembali.',
  },
  {
    q: 'Apakah saya harus membayar biaya langganan?',
    a: 'Tidak! Toku POS 100% Gratis digunakan untuk seluruh pelaku UMKM dan pemilik toko.',
  },
  {
    q: 'Printer apa saja yang didukung untuk cetak struk?',
    a: 'Toku POS mendukung semua printer thermal Bluetooth, USB, maupun WiFi dengan ukuran kertas standard 58mm dan 80mm langsung dari browser tanpa aplikasi tambahan.',
  },
  {
    q: 'Di perangkat apa saja Toku POS bisa dibuka?',
    a: 'Toku POS dapat diakses dari smartphone Android, iPhone, Tablet, iPad, Laptop, hingga Komputer kasir lewat browser tanpa perlu mengunduh installer dari PlayStore/AppStore.',
  },
]

function Landing() {
  const { data: session } = authClient.useSession()
  const [dark, setDark] = useState(isDarkMode)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<boolean>) => setDark(e.detail)
    window.addEventListener('toku_theme_change' as any, handleThemeChange)
    return () => window.removeEventListener('toku_theme_change' as any, handleThemeChange)
  }, [])

  const handleGoogleLogin = () => {
    authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' })
  }

  return (
    <div style={{ background: 'var(--color-surface)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background Dot Grid Layer */}
      <div className="bg-grid-pattern" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

      {/* Ambient Glow Orbs */}
      <div className="hero-glow-1" />
      <div className="hero-glow-2" />
      <div className="hero-glow-3" />

      {/* Glass Pill Navbar */}
      <nav
        className="glass-pill"
        style={{
          position: 'sticky',
          top: 12,
          zIndex: 50,
          maxWidth: 1040,
          margin: '0 auto 20px',
          borderRadius: 99,
          boxShadow: 'var(--shadow-md)',
          border: '1.5px solid var(--color-border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            gap: 12,
          }}
        >
          {/* Logo */}
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--color-brand)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 99, background: 'var(--color-brand-light)', border: '1px solid var(--color-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <StorefrontIcon size={20} weight="fill" color="var(--color-brand)" />
            </div>
            <span style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Toku POS</span>
          </span>

          {/* Right Action Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <button
              onClick={() => setDark(toggleTheme())}
              title={dark ? 'Ubah ke Mode Terang' : 'Ubah ke Mode Gelap'}
              aria-label="Toggle theme"
              className="press-tactile"
              style={{
                width: 36,
                height: 36,
                borderRadius: 99,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-2)',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {dark ? <SunIcon size={18} weight="duotone" color="var(--color-warning)" /> : <MoonIcon size={18} weight="duotone" color="var(--color-brand)" />}
            </button>

            {session ? (
              <Link
                to="/kasir"
                className="press-tactile"
                style={{
                  background: 'var(--color-brand)',
                  color: '#ffffff',
                  padding: '8px 20px',
                  borderRadius: 99,
                  fontWeight: 800,
                  fontSize: 13,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>Buka Kasir</span> <ArrowRightIcon size={14} weight="bold" />
              </Link>
            ) : (
              <button onClick={handleGoogleLogin} className="press-tactile" style={googleHeaderBtnStyle}>
                <GoogleLogoIcon size={16} weight="bold" />
                <span>Masuk</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Agency Hero Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '50px 20px 48px',
          maxWidth: 920,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--color-brand-light)',
            color: 'var(--color-brand)',
            padding: '6px 18px',
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 800,
            marginBottom: 24,
            border: '1.5px solid var(--color-brand)',
            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.15)',
          }}
        >
          <WifiHighIcon size={16} weight="fill" />
          KASIR DIGITAL OFFLINE-FIRST POS #1 MAKASSAR
        </div>

        <h1
          style={{
            fontSize: 'clamp(36px, 6.5vw, 62px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.035em',
            color: 'var(--color-text)',
            margin: '0 0 24px',
          }}
        >
          Kelola warungmu{' '}
          <span style={{ background: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            cepat & tanpa ribet
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px, 2.2vw, 19px)',
            color: 'var(--color-text-2)',
            lineHeight: 1.6,
            margin: '0 auto 36px',
            maxWidth: 660,
            fontWeight: 500,
          }}
        >
          Aplikasi Kasir POS Modern untuk UMKM Makassar. Gantikan buku catatan dengan sistem kasir otomatis yang tetap berjalan meskipun internet mati.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
          {session ? (
            <Link
              to="/kasir"
              className="press-tactile"
              style={{ ...heroBtnStyle, textDecoration: 'none' }}
            >
              <span>Buka Dashboard Kasir</span>
              <div style={heroIconCircle}>
                <ArrowRightIcon size={16} weight="bold" />
              </div>
            </Link>
          ) : (
            <button onClick={handleGoogleLogin} className="press-tactile" style={heroBtnStyle}>
              <GoogleLogoIcon size={20} weight="bold" />
              <span>Mulai Gratis Sekarang</span>
              <div style={heroIconCircle}>
                <ArrowRightIcon size={16} weight="bold" />
              </div>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap', fontSize: 13, color: 'var(--color-text-3)', fontWeight: 600 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <CheckCircleIcon size={16} weight="fill" color="var(--color-brand)" /> Gratis Selamanya
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <CheckCircleIcon size={16} weight="fill" color="var(--color-brand)" /> Bisa Digunakan Offline
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <CheckCircleIcon size={16} weight="fill" color="var(--color-brand)" /> Cetak Struk 80mm
          </span>
        </div>
      </section>

      {/* Interactive App Window Mockup */}
      <section style={{ padding: '0 20px 80px', maxWidth: 1040, margin: '0 auto' }}>
        <div
          className="doppelrand-shell"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          <div className="doppelrand-core" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Window Topbar */}
            <div
              style={{
                background: 'var(--color-surface-2)',
                padding: '12px 18px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 99, background: '#ef4444' }} />
                <div style={{ width: 12, height: 12, borderRadius: 99, background: '#f59e0b' }} />
                <div style={{ width: 12, height: 12, borderRadius: 99, background: '#10b981' }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheckIcon size={16} color="var(--color-brand)" weight="fill" />
                Toku POS — Warung Berkah Makassar (Mode Kasir Live)
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, background: 'var(--color-brand-light)', color: 'var(--color-brand)', padding: '2px 10px', borderRadius: 99, border: '1px solid var(--color-brand)' }}>
                ● ONLINE SYNC
              </span>
            </div>

            {/* Mockup Body Content */}
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, background: 'var(--color-surface)' }}>
              {/* Left catalog mock */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                  Katalog Barang Kasir
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  <MockItem name="Beras Premium 5kg" price={65000} stock={12} active />
                  <MockItem name="Minyak Goreng 2L" price={34000} stock={8} active />
                  <MockItem name="Kopi Hitam Toraja" price={15000} stock={25} />
                  <MockItem name="Gula Pasir 1kg" price={16500} stock={4} isLowStock />
                </div>
              </div>

              {/* Right cart mock */}
              <div style={{ background: 'var(--color-surface-2)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ShoppingCartIcon size={18} weight="fill" color="var(--color-brand)" /> Nota Belanja (2 Item)
                    </div>
                    <span className="price" style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-brand)' }}>#TX-1049</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--color-text)', fontWeight: 700 }}>1x Beras Premium 5kg</span>
                      <span className="price" style={{ fontWeight: 800, color: 'var(--color-text)' }}>Rp 65.000</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--color-text)', fontWeight: 700 }}>1x Minyak Goreng 2L</span>
                      <span className="price" style={{ fontWeight: 800, color: 'var(--color-text)' }}>Rp 34.000</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1.5px dashed var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase' }}>Total Bayar</span>
                    <span className="price" style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-brand)' }}>Rp 99.000</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ background: 'var(--color-brand)', color: '#fff', borderRadius: 99, padding: '8px', textAlign: 'center', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <MoneyIcon size={16} weight="bold" /> Tunai (Cash)
                    </div>
                    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderRadius: 99, padding: '8px', textAlign: 'center', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <QrCodeIcon size={16} weight="bold" /> QRIS Digital
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step How It Works Workflow */}
      <section style={{ padding: '64px 20px', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div className="eyebrow-tag" style={{ justifyContent: 'center' }}>CARA KERJA CEPAT</div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, margin: '4px 0 0', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            3 Langkah Mudah Memulai Jualan
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {STEPS.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.step} className="doppelrand-shell">
                <div className="doppelrand-core" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span className="price" style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-brand)', opacity: 0.8 }}>
                      {s.step}
                    </span>
                    <div style={{ width: 44, height: 44, borderRadius: 99, background: 'var(--color-brand-light)', border: '1px solid var(--color-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} weight="duotone" color="var(--color-brand)" />
                    </div>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px', color: 'var(--color-text)' }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--color-text-2)', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Bento Grid Features */}
      <section style={{ padding: '0 20px 80px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="eyebrow-tag" style={{ justifyContent: 'center' }}>FITUR LENGKAP KASIR</div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, margin: '4px 0 0', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Dirancang Khusus Untuk Kecepatan Jualan
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="doppelrand-shell">
                <div className="doppelrand-core" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 99,
                    background: 'var(--color-brand-light)',
                    border: '1px solid var(--color-brand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <Icon size={24} weight="duotone" color="var(--color-brand)" />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px', color: 'var(--color-text)', letterSpacing: '-0.015em' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--color-text-2)', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Comparison Matrix Section */}
      <section style={{ padding: '64px 20px', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="eyebrow-tag" style={{ justifyContent: 'center' }}>PERBANDINGAN KASIR</div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, margin: '4px 0 0', color: 'var(--color-text)' }}>
            Mengapa beralih ke Toku POS?
          </h2>
        </div>

        <div className="doppelrand-shell">
          <div className="doppelrand-core" style={{ padding: '12px 18px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '14px', fontSize: 13, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fitur & Pengalaman</th>
                  <th style={{ padding: '14px', fontSize: 13, color: 'var(--color-danger-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Buku Catatan Manual</th>
                  <th style={{ padding: '14px', fontSize: 13, color: 'var(--color-brand)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Toku POS Modern</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISONS.map((c, i) => (
                  <tr key={c.feature} style={{ borderBottom: i === COMPARISONS.length - 1 ? 'none' : '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '16px 14px', fontWeight: 800, fontSize: 14, color: 'var(--color-text)' }}>{c.feature}</td>
                    <td style={{ padding: '16px 14px', fontSize: 13, color: 'var(--color-text-2)', fontWeight: 500 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <XCircleIcon size={18} weight="fill" color="var(--color-danger)" /> {c.oldWay}
                      </span>
                    </td>
                    <td style={{ padding: '16px 14px', fontSize: 13, color: 'var(--color-text)', fontWeight: 700 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-brand)' }}>
                        <CheckCircleIcon size={18} weight="fill" color="var(--color-brand)" /> {c.tokuWay}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Store Categories Showcase */}
      <section
        style={{
          padding: '64px 20px',
          background: 'var(--color-surface-2)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <div className="eyebrow-tag">DUKUNGAN USAHA</div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, margin: '4px 0 32px', color: 'var(--color-text)' }}>
            Cocok Untuk Semua Jenis Toko & Warung
          </h2>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: 'center',
            }}
          >
            {CATEGORIES.map((c) => {
              const Icon = c.icon
              return (
                <div
                  key={c.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'var(--color-surface)',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 99,
                    padding: '12px 22px',
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <Icon size={20} weight="duotone" color="var(--color-brand)" />
                  {c.label}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section style={{ padding: '80px 20px', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div className="eyebrow-tag" style={{ justifyContent: 'center' }}>PERTANYAAN UMUM</div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, margin: '4px 0 0', color: 'var(--color-text)' }}>
            Pertanyaan yang Sering Diajukan
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={faq.q}
                className="squircle-card"
                style={{
                  cursor: 'pointer',
                  padding: '18px 22px',
                  borderColor: isOpen ? 'var(--color-brand)' : 'var(--color-border)',
                }}
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-text)' }}>
                    {faq.q}
                  </div>
                  {isOpen ? <CaretUpIcon size={18} weight="bold" color="var(--color-brand)" /> : <CaretDownIcon size={18} weight="bold" color="var(--color-text-3)" />}
                </div>
                {isOpen && (
                  <p style={{ margin: '12px 0 0', fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.6, fontWeight: 500 }}>
                    {faq.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section style={{ padding: '0 20px 80px', maxWidth: 960, margin: '0 auto' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#ffffff',
            boxShadow: '0 20px 40px -10px rgba(234, 88, 12, 0.4)',
          }}
        >
          <SparkleIcon size={36} weight="fill" style={{ opacity: 0.9, marginBottom: 12 }} />
          <h2 style={{ fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 800, margin: '0 0 14px', letterSpacing: '-0.02em' }}>
            Siap Modernkan Warungmu Hari Ini?
          </h2>
          <p style={{ fontSize: 16, opacity: 0.9, maxWidth: 540, margin: '0 auto 28px', lineHeight: 1.5, fontWeight: 500 }}>
            Mulai jualan lebih cepat, rapi, dan otomatis tanpa biaya apapun.
          </p>

          {session ? (
            <Link
              to="/kasir"
              className="press-tactile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: '#ffffff',
                color: '#EA580C',
                padding: '12px 28px',
                borderRadius: 99,
                fontWeight: 800,
                fontSize: 16,
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              }}
            >
              <span>Buka Kasir Sekarang</span>
              <ArrowRightIcon size={18} weight="bold" />
            </Link>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="press-tactile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: '#ffffff',
                color: '#EA580C',
                border: 'none',
                padding: '12px 28px',
                borderRadius: 99,
                fontWeight: 800,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              }}
            >
              <GoogleLogoIcon size={20} weight="bold" />
              <span>Daftar Gratis via Google</span>
              <ArrowRightIcon size={18} weight="bold" />
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          padding: '32px 20px',
          textAlign: 'center',
          fontSize: 13,
          color: 'var(--color-text-3)',
          fontWeight: 600,
        }}
      >
        © 2025 Toku POS · Dibuat untuk UMKM Makassar, Sulawesi Selatan
      </footer>
    </div>
  )
}

function MockItem({ name, price, stock, active, isLowStock }: { name: string; price: number; stock: number; active?: boolean; isLowStock?: boolean }) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: `1.5px solid ${active ? 'var(--color-brand)' : isLowStock ? 'var(--color-danger)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px',
        boxShadow: active ? '0 4px 14px rgba(234, 88, 12, 0.15)' : 'none',
        position: 'relative',
      }}
    >
      {active && (
        <div style={{ position: 'absolute', top: 6, right: 6, background: 'var(--color-brand)', color: '#fff', width: 16, height: 16, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircleIcon size={12} weight="fill" />
        </div>
      )}
      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text)', marginBottom: 2 }}>{name}</div>
      <div className="price" style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-brand)' }}>{formatIDR(price)}</div>
      <div style={{ fontSize: 10, color: isLowStock ? 'var(--color-danger-text)' : 'var(--color-text-3)', marginTop: 4, fontWeight: 700 }}>
        Stok: {stock} pcs {isLowStock && '⚠️'}
      </div>
    </div>
  )
}

const googleHeaderBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  background: 'var(--color-brand)',
  color: '#ffffff',
  border: 'none',
  borderRadius: 99,
  padding: '8px 20px',
  fontWeight: 800,
  fontSize: 13,
  cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
  whiteSpace: 'nowrap',
}

const heroBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  background: 'var(--color-brand)',
  color: '#ffffff',
  border: 'none',
  borderRadius: 99,
  padding: '10px 10px 10px 28px',
  fontWeight: 800,
  fontSize: 16,
  cursor: 'pointer',
  boxShadow: '0 8px 24px rgba(234, 88, 12, 0.4)',
}

const heroIconCircle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 99,
  background: 'rgba(255,255,255,0.25)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
