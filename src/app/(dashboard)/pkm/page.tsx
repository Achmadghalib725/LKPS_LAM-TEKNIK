'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import IconBadge from '@/components/IconBadge'
import RoleNotice, { useModulePermission } from '@/components/RoleNotice'
import {
  HeartHandshake,
  Zap,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  X,
  Save,
  Loader2,
} from 'lucide-react'

interface PkmRow {
  id: string
  judul: string
  namaDosen: string
  mahasiswaTerlibat: string
  tahun: number
}

export default function PkmPage() {
  const { canEdit } = useModulePermission('pkm')
  const [list, setList] = useState<PkmRow[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<PkmRow | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/pkm')
      if (res.ok) {
        const data = await res.json()
        setList(data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditing({
      id: `temp_${Date.now()}`,
      judul: '',
      namaDosen: '',
      mahasiswaTerlibat: '',
      tahun: new Date().getFullYear(),
    })
    setShowModal(true)
  }

  function openEdit(row: PkmRow) {
    setEditing({ ...row })
    setShowModal(true)
  }

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    try {
      const res = await fetch('/api/pkm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', payload: editing }),
      })
      if (res.ok) {
        await fetchData()
        setShowModal(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus data PkM ini?')) return
    try {
      const res = await fetch('/api/pkm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', payload: { id } }),
      })
      if (res.ok) fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <Header title="Kriteria 7: Pengabdian kepada Masyarakat (PkM)" subtitle="Kriteria 7" />
      <div className="page-content animate-fade-in">
        <div style={{ marginBottom: '24px' }}>
          <h2 className="section-title">Pengabdian kepada Masyarakat (PkM) Dosen</h2>
          <p className="section-subtitle">
            Tabel 7 LKPS – Data pengabdian masyarakat dosen tetap (DTPS) yang melibatkan mahasiswa aktif.
          </p>
        </div>

        <RoleNotice module="pkm" />

        {/* Realtime Formula Card */}
        <div className="card" style={{ marginBottom: '20px', background: 'rgba(249,115,22,0.04)', borderColor: 'rgba(249,115,22,0.15)' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <IconBadge color="orange" size="sm">
                <Zap size={18} strokeWidth={2} />
              </IconBadge>
              <div>
                <div className="card-title">Pelibatan Mahasiswa dalam PkM Dosen</div>
                <div className="card-subtitle">Matriks Penilaian LAM Teknik</div>
              </div>
            </div>
            <div className="score-display score-excellent">
              Total PkM: {list.length} Kegiatan
            </div>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Jumlah Mahasiswa Terlibat: <strong>{list.filter(p => p.mahasiswaTerlibat.trim().length > 0).length} Kegiatan PkM</strong>
          </div>
        </div>

        {saved && (
          <div className="badge badge-emerald" style={{ marginBottom: '16px', fontSize: '13px', padding: '8px 14px' }}>
            <CheckCircle2 size={14} strokeWidth={2} />
            Data PkM berhasil disimpan!
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <IconBadge color="orange" size="md">
                <HeartHandshake size={20} strokeWidth={1.75} />
              </IconBadge>
              <div>
                <div className="card-title">Daftar PkM Dosen (Tabel 7 LKPS)</div>
                <div className="card-subtitle">Total: {list.length} Data PkM</div>
              </div>
            </div>
            {canEdit && (
              <button id="btn-add-pkm" className="btn btn-primary" onClick={openAdd}>
                <Plus size={16} strokeWidth={2} />
                Tambah PkM
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data PkM...</div>
          ) : list.length === 0 ? (
            <div className="empty-state">
              <IconBadge color="orange" size="lg" style={{ marginBottom: '16px' }}>
                <HeartHandshake size={28} strokeWidth={1.5} />
              </IconBadge>
              <div className="empty-state-title">Belum ada data PkM dosen</div>
              <div className="empty-state-desc">Klik "Tambah PkM" untuk memasukkan judul kegiatan PkM dosen.</div>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Judul Kegiatan PkM</th>
                    <th>Nama Dosen Pengabdi</th>
                    <th>Mahasiswa Terlibat</th>
                    <th>Tahun</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((row, idx) => (
                    <tr key={row.id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{row.judul}</td>
                      <td>{row.namaDosen}</td>
                      <td>
                        {row.mahasiswaTerlibat && row.mahasiswaTerlibat !== '-' ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {row.mahasiswaTerlibat.split(',').map((name, i) => (
                              <span key={i} className="badge badge-emerald" style={{ whiteSpace: 'normal', textAlign: 'left' }}>
                                {name.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="badge badge-gray">Tidak ada</span>
                        )}
                      </td>
                      <td>{row.tahun}</td>
                      <td>
                        {canEdit ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(row)}>
                              <Edit3 size={13} strokeWidth={1.75} />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>
                              <Trash2 size={13} strokeWidth={1.75} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted">–</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && editing && canEdit && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing.id.startsWith('temp_') ? 'Tambah PkM' : 'Edit PkM'}</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Judul Kegiatan PkM <span className="required">*</span></label>
                <textarea className="form-textarea" rows={2} value={editing.judul} onChange={e => setEditing({ ...editing, judul: e.target.value })} placeholder="Pelatihan Instalasi Listrik dan Pemeliharaan..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nama Dosen Pengabdi <span className="required">*</span></label>
                  <input className="form-input" value={editing.namaDosen} onChange={e => setEditing({ ...editing, namaDosen: e.target.value })} placeholder="Ir. Nama Dosen, M.T." />
                </div>
                <div className="form-group">
                  <label className="form-label">Tahun Pelaksanaan</label>
                  <input type="number" className="form-input" value={editing.tahun} onChange={e => setEditing({ ...editing, tahun: parseInt(e.target.value) || new Date().getFullYear() })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Mahasiswa yang Dilibatkan (Nama / NIM)</label>
                <input className="form-input" value={editing.mahasiswaTerlibat} onChange={e => setEditing({ ...editing, mahasiswaTerlibat: e.target.value })} placeholder="Ahmad Ghalib (2015061001)" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="spin" size={16} strokeWidth={2} />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={16} strokeWidth={1.75} />
                    Simpan PkM
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

