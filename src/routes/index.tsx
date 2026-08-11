import { createFileRoute, Link } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import { useState, useEffect } from 'react'
import { isDarkMode, toggleTheme } from '#/lib/utils'
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
} from '@phosphor-icons/react'

export const Route = createFileRoute('/')({ component: Landing })

const FEATURES = [
  { icon: LightningIcon, title: 'Kasir Super Cepat', desc: 'Proses transaksi tunai & QRIS dalam hitungan detik. Tanpa loading bertele-tele.' },
  { icon: PackageIcon, title: 'Stok Terintegrasi', desc: 'Stok berkurang otomatis setiap ada transaksi. Alert visual saat stok tersisa sedikit.' },
  { icon: ChartBarIcon, title: 'Laporan Real-Time', desc: 'Pantau total omset, transaksi, dan barang terlaris hari ini secara otomatis.' },
  { icon: WifiHighIcon, title: 'Mode Offline-First', desc: 'Tetap jualan saat koneksi internet mati. Transaksi otomatis tersimpan dan disinkron.' },
  { icon: PrinterIcon, title: 'Cetak Struk Thermal', desc: 'Cetak nota transaksi langsung ke printer thermal Bluetooth/USB via browser.' },
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

function Landing() {
  const { data: session } = authClient.useSession()
  const [dark, setDark] = useState(isDarkMode)

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<boolean>) => setDark(e.detail)
    window.addEventListener('toku_theme_change' as any, handleThemeChange)
    return () => window.removeEventListener('toku_theme_change' as any, handleThemeChange)
  }, [])

  const handleGoogleLogin = () => {
    authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' })
  }

  return (
    <div style={{ background: 'var(--color-surface)', minHeight: '100vh' }}>
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
            <div style={{ width: 34, height: 34, borderRadius: 99, background: 'var(--color-brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <StorefrontIcon size={20} weight="fill" color="var(--color-brand)" />
            </div>
            <span style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Toku POS</span>
          </span>

          {/* Right Action Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {/* Theme Toggle Button */}
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
          padding: '60px 20px 64px',
          maxWidth: 860,
          margin: '0 auto',
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
          KASIR DIGITAL OFFLINE-FIRST POS
        </div>

        <h1
          style={{
            fontSize: 'clamp(36px, 7vw, 64px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.035em',
            color: 'var(--color-text)',
            margin: '0 0 24px',
          }}
        >
          Kelola warungmu{' '}
          <span style={{ color: 'var(--color-brand)' }}>dari HP & PC</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px, 2.5vw, 19px)',
            color: 'var(--color-text-2)',
            lineHeight: 1.6,
            margin: '0 auto 40px',
            maxWidth: 620,
            fontWeight: 500,
          }}
        >
          Aplikasi POS Modern untuk UMKM Makassar. Gantikan buku catatan dengan kasir digital serba cepat yang bekerja tanpa kendala internet di Android, iPhone, Tablet, maupun Komputer.
        </p>

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
            <span>Mulai Gratis dengan Google</span>
            <div style={heroIconCircle}>
              <ArrowRightIcon size={16} weight="bold" />
            </div>
          </button>
        )}

        <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 16, fontWeight: 600 }}>
          Gratis selamanya · Tanpa perlu install aplikasi · Bekerja Offline
        </p>
      </section>

      {/* Asymmetrical Bento Grid Features */}
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
              <div key={f.title} className="squircle-card">
                <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 99,
                    background: 'var(--color-brand-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <Icon size={24} weight="duotone" color="var(--color-brand)" />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 8px', color: 'var(--color-text)', letterSpacing: '-0.015em' }}>
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
