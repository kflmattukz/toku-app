import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { authClient } from '#/lib/auth-client'
import { useState } from 'react'
import { formatIDR, dayRange, weekRange, monthRange } from '#/lib/utils'
import { ChartLineUpIcon, MoneyIcon, ShoppingCartIcon, TrophyIcon, PackageIcon } from '@phosphor-icons/react'

export const Route = createFileRoute('/_app/laporan')({ component: Laporan })

type Range = 'hari' | 'minggu' | 'bulan'

function Laporan() {
  const { data: session } = authClient.useSession()
  const store = useQuery(api.stores.getByUserId, session ? { userId: session.user.id, userEmail: session.user.email } : 'skip')
  const [range, setRange] = useState<Range>('hari')

  const { startOfDay, endOfDay } = range === 'hari' ? dayRange() : range === 'minggu' ? weekRange() : monthRange()

  const summary = useQuery(
    api.transactions.dailySummary,
    store ? { storeId: store._id, startOfDay, endOfDay } : 'skip',
  )

  if (!summary) return <Loader />

  const totalRevenue = summary.total ?? 0
  const totalTransactions = summary.count ?? 0
  const txs = summary.transactions ?? []
  const totalItems = txs.reduce((sum, tx) => sum + tx.items.reduce((s, i) => s + i.qty, 0), 0)

  const productMap: Record<string, { name: string; totalQty: number; totalRevenue: number }> = {}
  for (const tx of txs) {
    for (const item of tx.items) {
      if (!productMap[item.name]) {
        productMap[item.name] = { name: item.name, totalQty: 0, totalRevenue: 0 }
      }
      productMap[item.name].totalQty += item.qty
      productMap[item.name].totalRevenue += item.price * item.qty
    }
  }
  const topProducts = Object.values(productMap).sort((a, b) => b.totalQty - a.totalQty)

  return (
    <div>
      {/* Header with period toggle pills */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <div className="eyebrow-tag">RINGKASAN OSET & REKAP</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '2px 0 0', color: 'var(--color-text)' }}>Laporan Penjualan</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-2)' }}>Pantau performa bisnis dan omset toko secara real-time</p>
        </div>

        <div style={{ display: 'flex', gap: 6, background: 'var(--color-surface-3)', padding: 4, borderRadius: 99, border: '1px solid var(--color-border)' }}>
          {[
            { key: 'hari', label: 'Hari Ini' },
            { key: 'minggu', label: 'Minggu Ini' },
            { key: 'bulan', label: 'Bulan Ini' },
          ].map((r) => {
            const active = range === r.key
            return (
              <button
                key={r.key}
                onClick={() => setRange(r.key as Range)}
                className="press-tactile"
                style={{
                  padding: '7px 16px',
                  borderRadius: 99,
                  border: 'none',
                  background: active ? 'var(--color-surface)' : 'transparent',
                  color: active ? 'var(--color-brand-dark)' : 'var(--color-text-2)',
                  fontSize: 13,
                  fontWeight: active ? 800 : 600,
                  cursor: 'pointer',
                  boxShadow: active ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 150ms ease',
                }}
              >
                {r.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main KPI Stat Cards — Doppelrand Architecture */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard
          icon={<MoneyIcon size={24} weight="duotone" color="var(--color-brand)" />}
          label="Total Pendapatan (Omset)"
          value={formatIDR(totalRevenue)}
          subtext={`Periode ${range === 'hari' ? 'hari ini' : range === 'minggu' ? 'minggu ini' : 'bulan ini'}`}
          isMoney
        />
        <StatCard
          icon={<ShoppingCartIcon size={24} weight="duotone" color="var(--color-brand)" />}
          label="Jumlah Transaksi"
          value={`${totalTransactions} Transaksi`}
          subtext="Total nota penjualan berhasil"
        />
        <StatCard
          icon={<ChartLineUpIcon size={24} weight="duotone" color="var(--color-brand)" />}
          label="Total Produk Terjual"
          value={`${totalItems} pcs`}
          subtext="Total item keluar dari toko"
        />
      </div>

      {/* Top-Selling Products Ranking List */}
      <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--color-brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrophyIcon size={20} weight="duotone" color="var(--color-brand-dark)" />
          </div>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>Produk Terlaris</h2>
            <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Peringkat berdasarkan jumlah kuantitas barang terjual</div>
          </div>
        </div>

        {topProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-3)' }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Belum ada transaksi pada periode ini.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topProducts.map((p: any, idx: number) => (
              <div
                key={p.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 99,
                      background: idx === 0 ? 'var(--color-brand)' : idx === 1 ? 'var(--color-surface-3)' : 'var(--color-surface-3)',
                      color: idx === 0 ? '#ffffff' : 'var(--color-text-2)',
                      fontSize: 13,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: idx === 0 ? '0 2px 8px rgba(16,185,129,0.3)' : 'none',
                    }}
                  >
                    #{idx + 1}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 2 }}>
                      Terjual {p.totalQty} pcs
                    </div>
                  </div>
                </div>

                <div className="price" style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-brand)', textAlign: 'right', flexShrink: 0 }}>
                  {formatIDR(p.totalRevenue)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ icon, label, value, subtext, isMoney }: { icon: React.ReactNode; label: string; value: string; subtext: string; isMoney?: boolean }) {
  return (
    <div className="doppelrand-shell">
      <div className="doppelrand-core" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
        </div>
        <div className={isMoney ? 'price' : ''} style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>{subtext}</div>
      </div>
    </div>
  )
}

function Loader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
      <PackageIcon size={48} color="var(--color-brand)" weight="duotone" style={{ opacity: 0.5 }} />
      <p style={{ color: 'var(--color-text-2)', fontSize: 14, fontWeight: 700 }}>Memuat laporan...</p>
    </div>
  )
}
