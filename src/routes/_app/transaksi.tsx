import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { authClient } from '#/lib/auth-client'
import { useState } from 'react'
import { formatIDR, formatDate } from '#/lib/utils'
import { ReceiptIcon, MoneyIcon, QrCodeIcon, PrinterIcon, XIcon, PackageIcon, CheckCircleIcon } from '@phosphor-icons/react'

export const Route = createFileRoute('/_app/transaksi')({ component: Transaksi })

function Transaksi() {
  const { data: session } = authClient.useSession()
  const store = useQuery(api.stores.getByUserId, session ? { userId: session.user.id, userEmail: session.user.email } : 'skip')
  const transactions = useQuery(api.transactions.list, store ? { storeId: store._id } : 'skip')
  const [selected, setSelected] = useState<any>(null)

  if (!transactions) return <Loader />

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow-tag">ARUS KAS & STRUK</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '2px 0 0', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Riwayat Transaksi</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-2)' }}>{transactions.length} transaksi penjualan berhasil dicatat</p>
      </div>

      {/* Transaction List — Card Architecture matching Dribbble POS image */}
      {transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--color-text-3)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)' }}>
          <ReceiptIcon size={52} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Belum ada transaksi. Lakukan penjualan di kasir!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {transactions.map((tx, idx) => (
            <div
              key={tx._id}
              onClick={() => setSelected(tx)}
              className="squircle-card press-tactile"
              style={{
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 99,
                    background: tx.paymentMethod === 'cash' ? 'var(--color-brand-light)' : 'var(--color-qris-bg)',
                    color: tx.paymentMethod === 'cash' ? 'var(--color-brand)' : 'var(--color-qris-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {tx.paymentMethod === 'cash' ? <MoneyIcon size={22} weight="duotone" /> : <QrCodeIcon size={22} weight="duotone" />}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-brand)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Penjualan #{transactions.length - idx}
                    </span>
                    {tx.syncedFromOffline && (
                      <span style={{ fontSize: 10, fontWeight: 800, background: 'var(--color-warning-light)', color: 'var(--color-warning-text)', padding: '2px 8px', borderRadius: 99 }}>
                        Synced Offline
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)' }}>
                    {tx.paymentMethod === 'cash' ? 'Pembayaran Tunai' : 'Pembayaran QRIS Digital'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 2 }}>
                    {formatDate(tx.createdAt)} · {tx.items.reduce((s: number, i: any) => s + i.qty, 0)} item
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                <span className="price" style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text)' }}>
                  {formatIDR(tx.total)}
                </span>
                <span
                  style={{
                    background: 'var(--color-success-light)',
                    color: 'var(--color-success-text)',
                    borderRadius: 99,
                    padding: '3px 10px',
                    fontSize: 11,
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <CheckCircleIcon size={12} weight="fill" />
                  Lunas
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      {selected && store && (
        <Modal onClose={() => setSelected(null)}>
          <div className="receipt-print">
            <Receipt tx={selected} storeName={store.name} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button
              onClick={() => window.print()}
              className="press-tactile"
              style={{ ...payBtnStyle, background: 'var(--color-brand)', color: '#ffffff', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)' }}
            >
              <PrinterIcon size={18} weight="bold" />
              Cetak Struk
            </button>
            <button onClick={() => setSelected(null)} className="press-tactile" style={{ ...payBtnStyle, background: 'var(--color-surface-2)', color: 'var(--color-text)', flex: 1, border: '1px solid var(--color-border)' }}>
              Tutup
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Receipt({ tx, storeName }: { tx: any; storeName: string }) {
  const now = new Date(tx.createdAt)
  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#000', lineHeight: 1.5 }}>
      <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: 10, marginBottom: 10 }}>
        <strong style={{ fontSize: 17 }}>{storeName}</strong>
        <div style={{ fontSize: 11, marginTop: 4 }}>
          {now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {tx.items.map((item: any, i: number) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
          <span>{item.name} x{item.qty}</span>
          <span>{formatIDR(item.price * item.qty)}</span>
        </div>
      ))}
      <div style={{ borderTop: '1px dashed #000', marginTop: 10, paddingTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14 }}>
          <span>TOTAL</span><span>{formatIDR(tx.total)}</span>
        </div>
        {tx.paymentMethod === 'cash' && <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}><span>Tunai</span><span>{formatIDR(tx.cashPaid)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Kembali</span><span>{formatIDR(tx.change)}</span></div>
        </>}
        {tx.paymentMethod === 'qris' && <div style={{ marginTop: 4 }}>Bayar via QRIS Digital</div>}
      </div>
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#666' }}>Terima kasih!</div>
    </div>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="animate-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="animate-modal" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '28px', width: '100%', maxWidth: 460, boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} className="press-tactile" style={{ position: 'absolute', top: 20, right: 20, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 99, cursor: 'pointer', color: 'var(--color-text-2)', display: 'flex', padding: 6 }}>
          <XIcon size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}

function Loader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
      <PackageIcon size={48} color="var(--color-brand)" weight="duotone" style={{ opacity: 0.5 }} />
      <p style={{ color: 'var(--color-text-2)', fontSize: 14, fontWeight: 700 }}>Memuat riwayat transaksi...</p>
    </div>
  )
}

const payBtnStyle: React.CSSProperties = { width: '100%', padding: '14px 20px', border: 'none', borderRadius: 99, fontSize: 15, fontWeight: 800, cursor: 'pointer', color: '#ffffff' }
