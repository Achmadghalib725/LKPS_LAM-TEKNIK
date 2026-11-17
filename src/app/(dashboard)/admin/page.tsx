'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import IconBadge from '@/components/IconBadge'
import RoleNotice, { useModulePermission } from '@/components/RoleNotice'
import {
  Users,
  UserPlus,
  ShieldAlert,
  Edit2,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  X,
  Building,
  ShieldCheck,
  UserCheck,
  Eye,
  SlidersHorizontal,
} from 'lucide-react'
import { ROLE_DESCRIPTIONS, UserRole } from '@/lib/permissions'

interface UserItem {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
  prodi?: {
    id: string
    namaProdi: string
    jenjang: string
  } | null
}

interface ProdiItem {
  id: string
  namaProdi: string
  jenjang: string
}

export default function AdminUsersPage() {
  const { canEdit } = useModulePermission('admin')
  const [users, setUsers] = useState<UserItem[]>([])
  const [prodiList, setProdiList] = useState<ProdiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formRole, setFormRole] = useState<UserRole>('OPERATOR_PRODI')
  const [formProdiId, setFormProdiId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [filterRole, setFilterRole] = useState<string>('ALL')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
        setProdiList(data.prodiList || [])
      } else {
        const errData = await res.json()
        setError(errData.error || 'Gagal memuat data pengguna')
      }
    } catch {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  function handleOpenCreate() {
    setEditingUser(null)
    setFormName('')
    setFormEmail('')
    setFormPassword('')
    setFormRole('OPERATOR_PRODI')
    setFormProdiId('')
    setError('')
    setSuccess('')
    setModalOpen(true)
  }

  function handleOpenEdit(u: UserItem) {
    setEditingUser(u)
    setFormName(u.name)
    setFormEmail(u.email)
    setFormPassword('')
    setFormRole(u.role)
    setFormProdiId(u.prodi?.id || '')
    setError('')
    setSuccess('')
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const payload: any = {
        name: formName,
        email: formEmail,
        role: formRole,
        prodiId: formProdiId || null,
      }
      if (editingUser) {
        payload.id = editingUser.id
        if (formPassword.trim()) payload.password = formPassword
      } else {
        payload.password = formPassword
      }

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok) {
        setSuccess(editingUser ? 'Data pengguna berhasil diperbarui!' : 'Pengguna baru berhasil ditambahkan!')
        setModalOpen(false)
        fetchUsers()
      } else {
        setError(data.error || 'Gagal menyimpan pengguna')
      }
    } catch {
      setError('Terjadi kesalahan saat memproses data')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(u: UserItem) {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun ${u.name} (${u.email})?`)) return

    try {
      const res = await fetch(`/api/admin/users?id=${u.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        setSuccess(`Akun ${u.name} berhasil dihapus.`)
        fetchUsers()
      } else {
        setError(data.error || 'Gagal menghapus pengguna')
      }
    } catch {
      setError('Gagal menghapus pengguna')
    }
  }

  const filteredUsers = filterRole === 'ALL' ? users : users.filter((u) => u.role === filterRole)

  return (
    <>
      <Header title="Manajemen Pengguna & Hak Akses" subtitle="Super Admin Panel" />

      <div className="page-content">
        <RoleNotice module="admin" />

        {/* Tab Navigasi Admin Panel */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary">
            <Users size={15} />
            <span>Manajemen Akun Pengguna</span>
          </button>
          <Link href="/konfigurasi" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            <SlidersHorizontal size={15} />
            <span>Struktur Kriteria & Tabel LKPS (Dinamis)</span>
          </Link>
        </div>

        {/* Banner Penjelasan Peran */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <IconBadge color="purple" size="md">
              <ShieldCheck size={20} strokeWidth={2} />
            </IconBadge>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Matriks Hak Akses & Batasan Peran Sistem LKPS
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Sistem menerapkan kontrol akses berbasis peran (Role-Based Access Control) yang ketat sesuai regulasi LAM Teknik.
              </p>
            </div>
          </div>

          <div className="grid-4" style={{ gap: '14px' }}>
            {(Object.keys(ROLE_DESCRIPTIONS) as UserRole[]).map((r) => {
              const info = ROLE_DESCRIPTIONS[r]
              const colors: Record<UserRole, { badge: string; border: string }> = {
                SUPER_ADMIN: { badge: 'role-badge-super_admin', border: '#e9d5ff' },
                ADMIN_UPPS: { badge: 'role-badge-admin_upps', border: '#bfdbfe' },
                OPERATOR_PRODI: { badge: 'role-badge-operator_prodi', border: '#bbf7d0' },
                ASESOR: { badge: 'role-badge-asesor', border: '#fed7aa' },
                GUEST: { badge: 'badge-gray', border: '#e2e8f0' },
              }
              return (
                <div
                  key={r}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className={colors[r].badge}>{info.title.split(' ')[0]} {info.title.split(' ')[1]}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
                    {info.deskripsi}
                  </p>
                  <div style={{ fontSize: '11.5px', color: 'var(--accent-blue)', fontWeight: 600 }}>
                    {info.wewenang.length} Wewenang Utama
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Feedback Alert */}
        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} strokeWidth={2} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} strokeWidth={2} />
            <span>{success}</span>
          </div>
        )}

        {/* Tabel Pengguna */}
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div className="card-title">Daftar Akun Pengguna Terdaftar</div>
              <div className="card-subtitle">Kelola akun institusi, tetapkan hak akses peran, dan asosiasi program studi</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '7px 32px 7px 12px', fontSize: '13px' }}
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="ALL">Semua Peran ({users.length})</option>
                <option value="ADMIN_UPPS">Admin UPPS</option>
                <option value="OPERATOR_PRODI">Operator Prodi</option>
                <option value="ASESOR">Asesor Internal</option>
                <option value="GUEST">Guest (SSO)</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>

              {canEdit && (
                <button className="btn btn-primary btn-sm" onClick={handleOpenCreate}>
                  <UserPlus size={15} strokeWidth={2} />
                  Tambah Pengguna
                </button>
              )}
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>No</th>
                  <th>Nama Lengkap</th>
                  <th>Email Login</th>
                  <th>Peran (Role)</th>
                  <th>Unit / Prodi Terkait</th>
                  <th style={{ textAlign: 'center', width: '120px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px' }}>
                      <Loader2 className="spin" size={24} style={{ margin: '0 auto', color: 'var(--accent-blue)' }} />
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                      Tidak ada pengguna yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, idx) => (
                    <tr key={u.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{u.name}</strong>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge-${String(u.role).toLowerCase()}`}>
                          {u.role === 'SUPER_ADMIN' && 'Super Admin'}
                          {u.role === 'ADMIN_UPPS' && 'Admin UPPS'}
                          {String(u.role) === 'PENANGGUNG_JAWAB' && 'Admin UPPS'}
                          {u.role === 'OPERATOR_PRODI' && 'Operator Prodi'}
                          {u.role === 'ASESOR' && 'Asesor Internal'}
                          {u.role === 'GUEST' && 'Guest (SSO)'}
                        </span>
                      </td>
                      <td>
                        {u.prodi ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                            <Building size={14} className="text-accent-blue" />
                            {u.prodi.namaProdi} ({u.prodi.jenjang})
                          </span>
                        ) : (
                          <span className="text-xs text-muted">Institusi / Seluruh UPPS</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {canEdit ? (
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '6px', color: 'var(--accent-blue)' }}
                              title="Edit Pengguna"
                              onClick={() => handleOpenEdit(u)}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '6px', color: 'var(--accent-rose)' }}
                              title="Hapus Pengguna"
                              onClick={() => handleDelete(u)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted">–</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Tambah / Edit Pengguna */}
      {modalOpen && canEdit && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IconBadge color="blue" size="sm">
                  <Users size={16} />
                </IconBadge>
                <div className="modal-title">
                  {editingUser ? `Edit Akun: ${editingUser.name}` : 'Tambah Pengguna Baru'}
                </div>
              </div>
              <button
                className="btn-ghost"
                style={{ padding: '4px', border: 'none', background: 'none' }}
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">
                    Nama Lengkap <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Ir. Budi Santoso, M.T."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Email Login <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="nama@lkps.ac.id"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Password {editingUser && <span className="text-xs text-muted">(Kosongkan jika tidak ingin mengubah)</span>}
                    {!editingUser && <span className="required">*</span>}
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder={editingUser ? '••••••••' : 'Minimal 6 karakter'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    required={!editingUser}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Peran / Hak Akses <span className="required">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as UserRole)}
                      required
                    >
                      <option value="ADMIN_UPPS">Admin UPPS (Fakultas / Otoritas Penuh)</option>
                      <option value="OPERATOR_PRODI">Operator Prodi (Pengisian Borang)</option>
                      <option value="ASESOR">Asesor Internal (Read-Only)</option>
                      <option value="GUEST">Guest (SSO Kampus - Ringkasan Fakultas)</option>
                      <option value="SUPER_ADMIN">Super Admin (Institusi)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Program Studi Terkait</label>
                    <select
                      className="form-select"
                      value={formProdiId}
                      onChange={(e) => setFormProdiId(e.target.value)}
                      disabled={formRole === 'SUPER_ADMIN' || formRole === 'ADMIN_UPPS' || formRole === 'GUEST'}
                    >
                      <option value="">-- Tidak Ditentukan / Institusi --</option>
                      {prodiList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.namaProdi} ({p.jenjang})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)'
                }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Catatan Peran: </strong>
                  {formRole === 'SUPER_ADMIN' && 'Memiliki akses kontrol penuh ke semua modul sistem dan akun.'}
                  {formRole === 'ADMIN_UPPS' && 'Otoritas menyeluruh: Mengelola seluruh data borang LKPS (Kriteria 1-9) dan manajemen pengguna.'}
                  {formRole === 'OPERATOR_PRODI' && 'Dapat mengisi & mengedit seluruh borang akreditasi (Kriteria 1-9), tidak dapat mengakses manajemen pengguna.'}
                  {formRole === 'ASESOR' && 'Read-Only: Melihat data borang, dashboard ringkasan data, dan simulasi skor penilaian.'}
                  {formRole === 'GUEST' && 'Read-Only (SSO): Hanya melihat dashboard ringkasan data capaian akreditasi prodi di tingkat fakultas.'}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="spin" size={15} />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Simpan Pengguna
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
