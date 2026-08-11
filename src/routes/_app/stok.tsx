import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { authClient } from '#/lib/auth-client'
import { useState } from 'react'
import { formatIDR } from '#/lib/utils'
import type { Id } from '../../../convex/_generated/dataModel'
import { WarningIcon, CheckCircleIcon, PlusIcon, PackageIcon } from '@phosphor-icons/react'

export const Route = createFileRoute('/_app/stok')({ component: Stok })

const LOW_STOCK = 5

function Stok() {
  const { data: session } = authClient.useSession()
  const store = useQuery(api.stores.getByUserId, session ? { userId: session.user.id, userEmail: session.user.email } : 'skip')
  const products = useQuery(api.products.list, store ? { storeId: store._id } : 'skip')
  const adjustStock = useMutation(api.products.adjustStock)

  const [restockId, setRestockId] = useState<Id<'products'> | null>(null)
  const [restockAmt, setRestockAmt] = useState('')

  const lowStock = (products ?? []).filter((p) => p.stock <= LOW_STOCK)
  const okStock = (products ?? []).filter((p) => p.stock > LOW_STOCK)

  const handleRestock = async (id: Id<'products'>) => {
    const amt = parseInt(restockAmt) || 0
    if (amt <= 0) return
    await adjustStock({ id, delta: amt })
    setRestockId(null)
    setRestockAmt('')
  }

  if (!products) return <Loader />

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow-tag">MANAJEMEN PERSEDIAAN</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '2px 0 0', color: 'var(--color-text)' }}>Kontrol Stok Barang</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-2)' }}>Pantau dan lakukan restock cepat untuk barang yang hampir habis</p>
      </div>

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
        <div style={{ background: 'var(--color-danger-light)', border: '1.5px solid var(--color-danger)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-danger-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Stok Rendah</span>
            <WarningIcon size={20} weight="fill" color="var(--color-danger)" />
          </div>
          <div className="price" style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-danger-text)' }}>{lowStock.length}</div>
          <div style={{ fontSize: 12, color: 'var(--color-danger-text)', opacity: 0.8, marginTop: 4 }}>Produk perlu restock segera</div>
        </div>

        <div style={{ background: 'var(--color-brand-light)', border: '1.5px solid var(--color-brand)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-brand-dark)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Stok Aman</span>
            <CheckCircleIcon size={20} weight="fill" color="var(--color-brand-dark)" />
          </div>
          <div className="price" style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-brand-dark)' }}>{okStock.length}</div>
          <div style={{ fontSize: 12, color: 'var(--color-brand-dark)', opacity: 0.8, marginTop: 4 }}>Produk persediaan cukup</div>
        </div>
      </div>

      {/* Low stock alert section */}
      {lowStock.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <WarningIcon size={20} weight="fill" color="var(--color-danger)" />
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>Perlu Restock Segera (Stok ≤ 5)</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {lowStock.map((p) => (
              <div key={p._id} style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-danger)', borderRadius: 'var(--radius-lg)', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)', marginBottom: 2 }}>{p.name}</div>
                    <span style={{ fontSize: 12, color: 'var(--color-text-3)', fontWeight: 600 }}>{p.category}</span>
                  </div>
                  <span className="price" style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-danger)' }}>{p.stock} pcs</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                  <span className="price" style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-brand)' }}>{formatIDR(p.price)}</span>
                  {restockId === p._id ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="number"
                        placeholder="+Stok"
                        value={restockAmt}
                        onChange={(e) => setRestockAmt(e.target.value)}
                        style={{ width: 70, padding: '6px 10px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: 13, background: 'var(--color-surface-2)', color: 'var(--color-text)', fontWeight: 700, outline: 'none' }}
                        autoFocus
                      />
                      <button onClick={() => handleRestock(p._id)} className="press-tactile" style={smallPrimaryBtn}>Simpan</button>
                    </div>
                  ) : (
                    <button onClick={() => { setRestockId(p._id); setRestockAmt('') }} className="press-tactile" style={smallPrimaryBtn}>
                      <PlusIcon size={14} weight="bold" /> Restock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All products inventory section */}
      <section>
        <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 14px', color: 'var(--color-text)' }}>Semua Persediaan Produk</h2>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                  {['Nama Produk', 'Kategori', 'Stok Saat Ini', 'Status Persediaan', 'Aksi Restock'].map((h) => (
                    <th key={h} style={{ padding: '16px 20px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const isLow = p.stock <= LOW_STOCK
                  return (
                    <tr key={p._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)' }}>{p.name}</div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 99, padding: '4px 12px', fontSize: 12, color: 'var(--color-text-2)', fontWeight: 600 }}>
                          {p.category}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span className="price" style={{ fontWeight: 800, fontSize: 16, color: isLow ? 'var(--color-danger)' : 'var(--color-text)' }}>
                          {p.stock}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ background: isLow ? 'var(--color-danger-light)' : 'var(--color-brand-light)', color: isLow ? 'var(--color-danger-text)' : 'var(--color-brand-dark)', borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {isLow ? <WarningIcon size={12} weight="fill" /> : <CheckCircleIcon size={12} weight="fill" />}
                          {isLow ? 'Stok Rendah' : 'Aman'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {restockId === p._id ? (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input
                              type="number"
                              placeholder="+Stok"
                              value={restockAmt}
                              onChange={(e) => setRestockAmt(e.target.value)}
                              style={{ width: 80, padding: '6px 10px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: 13, background: 'var(--color-surface-2)', color: 'var(--color-text)', fontWeight: 700, outline: 'none' }}
                              autoFocus
                            />
                            <button onClick={() => handleRestock(p._id)} className="press-tactile" style={smallPrimaryBtn}>Simpan</button>
                            <button onClick={() => setRestockId(null)} className="press-tactile" style={{ ...smallPrimaryBtn, background: 'var(--color-surface-2)', color: 'var(--color-text-2)', border: '1px solid var(--color-border)' }}>Batal</button>
                          </div>
                        ) : (
                          <button onClick={() => { setRestockId(p._id); setRestockAmt('') }} className="press-tactile" style={smallPrimaryBtn}>
                            <PlusIcon size={14} weight="bold" /> Tambah Stok
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}

function Loader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
      <PackageIcon size={48} color="var(--color-brand)" weight="duotone" style={{ opacity: 0.5 }} />
      <p style={{ color: 'var(--color-text-2)', fontSize: 14, fontWeight: 700 }}>Memuat stok...</p>
    </div>
  )
}

const tdStyle: React.CSSProperties = { padding: '16px 20px', fontSize: 14, color: 'var(--color-text)' }
const smallPrimaryBtn: React.CSSProperties = { padding: '7px 14px', background: 'var(--color-brand)', color: '#ffffff', border: 'none', borderRadius: 99, fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }
