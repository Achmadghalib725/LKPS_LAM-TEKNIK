'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import IconBadge from '@/components/IconBadge'
import RoleNotice, { useModulePermission } from '@/components/RoleNotice'
import {
  Building2,
  GraduationCap,
  Users,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Loader2,
  Building,
  School,
  FileCheck,
  FileText,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  Calendar,
  UserCheck,
  Paperclip,
  Info,
} from 'lucide-react'

interface IdentitasPT {
  namaPT: string
  namaUPPS: string
  jenisProgram: string
  namaProdi: string
  alamat: string
  kota: string
  kodePos: string
  telepon: string
  email: string
  website: string
  noSkPendirianPT: string
  tanggalSkPT: string
  pejabatSkPendirianPT: string
  fileSkPendirianPT: string
  noSkPembukaanPS: string
  tanggalSkPS: string
  pejabatSkPembukaanPS: string
  fileSkPembukaanPS: string
  tahunPertama: string
  peringkatAkreditasi: string
  nomorSkAkreditasi: string
  fileSkAkreditasi: string
  namaPengusul: string
  tanggalPengusul: string
  tahunTS: string
}

interface ProdiRow {
  id: string
  namaProdi: string
  jenjang: string
  peringkatAkreditasi: string
  jumlahMahasiswaAktif: string
}

interface TimPenyusunRow {
  id: string
  nama: string
  nidn: string
  jabatan: string
}

export default function IdentitasPage() {
  const { canEdit } = useModulePermission('identitas')
  const [activeTab, setActiveTab] = useState<'identitas' | 'prodi' | 'tim'>('identitas')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const [identitas, setIdentitas] = useState<IdentitasPT>({
    namaPT: 'Universitas Lampung',
    namaUPPS: 'Fakultas Teknik',
    jenisProgram: 'Sarjana',
    namaProdi: 'Teknik Informatika',
    alamat: 'Jl. Prof. Dr. Sumantri Brojonegoro No. 1, Gedong Meneng',
    kota: 'Kota Bandar Lampung',
    kodePos: '35145',
    telepon: '(0721) 704947',
    email: 'dekan@eng.unila.ac.id',
    website: 'https://eng.unila.ac.id',
    noSkPendirianPT: '',
    tanggalSkPT: '',
    pejabatSkPendirianPT: '',
    fileSkPendirianPT: '',
    noSkPembukaanPS: '',
    tanggalSkPS: '',
    pejabatSkPembukaanPS: '',
    fileSkPembukaanPS: '',
    tahunPertama: '',
    peringkatAkreditasi: 'Baik Sekali',
    nomorSkAkreditasi: '',
    fileSkAkreditasi: '',
    namaPengusul: '',
    tanggalPengusul: '',
    tahunTS: '2024/2025',
  })

  const [prodiList, setProdiList] = useState<ProdiRow[]>([
    { id: '1', namaProdi: '', jenjang: 'S1', peringkatAkreditasi: '', jumlahMahasiswaAktif: '0' },
  ])

  const [timList, setTimList] = useState<TimPenyusunRow[]>([
    { id: '1', nama: '', nidn: '', jabatan: '' },
  ])

  function addProdi() {
    setProdiList(prev => [...prev, { id: Date.now().toString(), namaProdi: '', jenjang: 'S1', peringkatAkreditasi: '', jumlahMahasiswaAktif: '0' }])
  }

  function removeProdi(id: string) {
    setProdiList(prev => prev.filter(p => p.id !== id))
  }

  function updateProdi(id: string, field: keyof ProdiRow, value: string) {
    setProdiList(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  function addTim() {
    setTimList(prev => [...prev, { id: Date.now().toString(), nama: '', nidn: '', jabatan: '' }])
  }

  function removeTim(id: string) {
    setTimList(prev => prev.filter(t => t.id !== id))
  }

  function updateTim(id: string, field: keyof TimPenyusunRow, value: string) {
    setTimList(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/identitas')
      if (res.ok) {
        const data = await res.json()
        if (data.identitas) {
          setIdentitas({
            namaPT: data.identitas.namaPT ?? 'Universitas Lampung',
            namaUPPS: data.identitas.namaUPPS ?? 'Fakultas Teknik',
            jenisProgram: data.identitas.jenisProgram ?? 'Sarjana',
            namaProdi: data.identitas.namaProdi ?? 'Teknik Informatika',
            alamat: data.identitas.alamat ?? 'Jl. Prof. Dr. Sumantri Brojonegoro No. 1, Gedong Meneng',
            kota: data.identitas.kota ?? 'Kota Bandar Lampung',
            kodePos: data.identitas.kodePos ?? '35145',
            telepon: data.identitas.telepon ?? '(0721) 704947',
            email: data.identitas.email ?? 'dekan@eng.unila.ac.id',
            website: data.identitas.website ?? 'https://eng.unila.ac.id',
            noSkPendirianPT: data.identitas.noSkPendirianPT ?? '',
            tanggalSkPT: data.identitas.tanggalSkPT ? data.identitas.tanggalSkPT.split('T')[0] : '',
            pejabatSkPendirianPT: data.identitas.pejabatSkPendirianPT ?? '',
            fileSkPendirianPT: data.identitas.fileSkPendirianPT ?? '',
            noSkPembukaanPS: data.identitas.noSkPembukaanPS ?? '',
            tanggalSkPS: data.identitas.tanggalSkPS ? data.identitas.tanggalSkPS.split('T')[0] : '',
            pejabatSkPembukaanPS: data.identitas.pejabatSkPembukaanPS ?? '',
            fileSkPembukaanPS: data.identitas.fileSkPembukaanPS ?? '',
            tahunPertama: data.identitas.tahunPertama ?? '',
            peringkatAkreditasi: data.identitas.peringkatAkreditasi ?? 'Baik Sekali',
            nomorSkAkreditasi: data.identitas.nomorSkAkreditasi ?? '',
            fileSkAkreditasi: data.identitas.fileSkAkreditasi ?? '',
            namaPengusul: data.identitas.namaPengusul ?? '',
            tanggalPengusul: data.identitas.tanggalPengusul ? data.identitas.tanggalPengusul.split('T')[0] : '',
            tahunTS: data.identitas.tahunTS ?? '2024/2025',
          })
        }
        if (data.prodiList && data.prodiList.length > 0) {
          setProdiList(data.prodiList.map((p: any) => ({
            id: p.id,
            namaProdi: p.namaProdi || '',
            jenjang: p.jenjang || 'S1',
            peringkatAkreditasi: p.peringkatAkreditasi || '',
            jumlahMahasiswaAktif: (p.jumlahMahasiswaAktif ?? 0).toString(),
          })))
        }
        if (data.timList && data.timList.length > 0) {
          setTimList(data.timList.map((t: any) => ({
            id: t.id,
            nama: t.nama || '',
            nidn: t.nidn || '',
            jabatan: t.jabatan || 'Anggota Tim',
          })))
        }
      }
    } catch (err) {
      console.error('Failed to fetch Identitas data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!canEdit) return
    setSaving(true)
    try {
      const res = await fetch('/api/identitas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identitas, prodiList, timList }),
      })
      if (res.ok) {
        await fetchData()
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Header title="Identitas & Tim Penyusun" subtitle="Module 1" />
      <div className="page-content animate-fade-in">
        <div style={{ marginBottom: '24px' }}>
          <h2 className="section-title">Identitas Program Studi & Pengusul</h2>
          <p className="section-subtitle">
            Formulir baku instrumen LAM Teknik (Sheet Menu Cover): Identitas Perguruan Tinggi, UPPS, legalitas SK, akreditasi, dan pengesahan borang.
          </p>
        </div>

        <RoleNotice module="identitas" />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '28px' }}>
          {[
            { key: 'identitas', label: 'Identitas PT & Pengusul (Sheet Menu)', icon: Building2 },
            { key: 'prodi', label: 'Daftar Prodi di UPPS (Sheet PS)', icon: GraduationCap },
            { key: 'tim', label: 'Tim Penyusun LKPS', icon: Users },
          ].map(tab => {
            const TabIcon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--accent-blue)' : '2px solid transparent',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                  marginBottom: '-1px',
                }}
              >
                <TabIcon size={16} strokeWidth={1.75} style={{ opacity: isActive ? 1 : 0.7 }} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab 1: Identitas PT & Pengusul */}
        {activeTab === 'identitas' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Box Format Baku */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
                border: '1px solid rgba(14, 165, 233, 0.25)',
                borderRadius: '12px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span className="badge badge-blue" style={{ marginBottom: '8px', display: 'inline-block' }}>
                  LAM TEKNIK VERSI 1.0
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                  AKREDITASI PROGRAM STUDI KETEKNIKAN
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Formulir Instrumen Penilaian LKPS: Program Akademik & Vokasi
                </p>
              </div>
              <div style={{ textAlign: 'right', display: 'none', md: { display: 'block' } } as any}>
                <span className="text-xs text-muted">Kode Lembar:</span>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--accent-blue)' }}>Sheet &apos;Menu&apos; Cover</div>
              </div>
            </div>

            {/* Bagian 1: Identitas Institusi & Program Studi */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <IconBadge color="blue" size="md">
                    <Building size={20} strokeWidth={1.75} />
                  </IconBadge>
                  <div>
                    <div className="card-title">1. Identitas Perguruan Tinggi & Program Studi</div>
                    <div className="card-subtitle">Profil dasar institusi pengelola dan program studi pengusul</div>
                  </div>
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: '18px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Perguruan Tinggi <span className="required">*</span></label>
                  <input
                    className="form-input"
                    placeholder="Contoh: Universitas Lampung"
                    disabled={!canEdit}
                    value={identitas.namaPT}
                    onChange={e => setIdentitas(p => ({ ...p, namaPT: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Unit Pengelola Program Studi (UPPS) <span className="required">*</span></label>
                  <input
                    className="form-input"
                    placeholder="Contoh: Fakultas Teknik"
                    disabled={!canEdit}
                    value={identitas.namaUPPS}
                    onChange={e => setIdentitas(p => ({ ...p, namaUPPS: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: '18px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Jenis Program <span className="required">*</span></label>
                  <select
                    className="form-select"
                    disabled={!canEdit}
                    value={identitas.jenisProgram}
                    onChange={e => setIdentitas(p => ({ ...p, jenisProgram: e.target.value }))}
                  >
                    <option value="Sarjana">Sarjana (S1)</option>
                    <option value="Sarjana Terapan">Sarjana Terapan (D4)</option>
                    <option value="Diploma Tiga">Diploma Tiga (D3)</option>
                    <option value="Diploma Dua">Diploma Dua (D2)</option>
                    <option value="Diploma Satu">Diploma Satu (D1)</option>
                    <option value="Magister">Magister (S2)</option>
                    <option value="Magister Terapan">Magister Terapan (S2 Terapan)</option>
                    <option value="Doktor">Doktor (S3)</option>
                    <option value="Doktor Terapan">Doktor Terapan (S3 Terapan)</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nama Program Studi <span className="required">*</span></label>
                  <input
                    className="form-input"
                    placeholder="Contoh: Teknik Informatika"
                    disabled={!canEdit}
                    value={identitas.namaProdi}
                    onChange={e => setIdentitas(p => ({ ...p, namaProdi: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label">Alamat Kampus</label>
                <textarea
                  className="form-textarea"
                  placeholder="Jl. Prof. Dr. Sumantri Brojonegoro No. 1, Gedong Meneng"
                  disabled={!canEdit}
                  value={identitas.alamat}
                  onChange={e => setIdentitas(p => ({ ...p, alamat: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="form-row" style={{ marginBottom: '18px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Kota / Kabupaten</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="form-input"
                      placeholder="Contoh: Kota Bandar Lampung"
                      disabled={!canEdit}
                      value={identitas.kota}
                      onChange={e => setIdentitas(p => ({ ...p, kota: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Kode Pos</label>
                  <input
                    className="form-input"
                    placeholder="Contoh: 35145"
                    disabled={!canEdit}
                    value={identitas.kodePos}
                    onChange={e => setIdentitas(p => ({ ...p, kodePos: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nomor Telepon</label>
                  <input
                    className="form-input"
                    placeholder="Contoh: (0721) 704947"
                    disabled={!canEdit}
                    value={identitas.telepon}
                    onChange={e => setIdentitas(p => ({ ...p, telepon: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">E-mail Resmi</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Contoh: dekan@eng.unila.ac.id"
                    disabled={!canEdit}
                    value={identitas.email}
                    onChange={e => setIdentitas(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Website</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://eng.unila.ac.id"
                    disabled={!canEdit}
                    value={identitas.website}
                    onChange={e => setIdentitas(p => ({ ...p, website: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: SK Pendirian & Pembukaan */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <IconBadge color="cyan" size="md">
                    <FileCheck size={20} strokeWidth={1.75} />
                  </IconBadge>
                  <div>
                    <div className="card-title">2. Legalitas SK Pendirian PT & Pembukaan PS</div>
                    <div className="card-subtitle">Nomor, tanggal penetapan, dan pejabat penandatangan SK resmi</div>
                  </div>
                </div>
              </div>

              {/* Sub: SK Pendirian PT */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span className="badge badge-blue">SK Pendirian PT (1)</span>
                  <span className="text-xs text-muted">* Wajib dilampirkan salinan SK</span>
                </div>
                <div className="form-row" style={{ marginBottom: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nomor SK Pendirian PT</label>
                    <input
                      className="form-input"
                      placeholder="Nomor SK Pendirian Perguruan Tinggi..."
                      disabled={!canEdit}
                      value={identitas.noSkPendirianPT}
                      onChange={e => setIdentitas(p => ({ ...p, noSkPendirianPT: e.target.value }))}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tanggal SK Pendirian PT</label>
                    <input
                      type="date"
                      className="form-input"
                      disabled={!canEdit}
                      value={identitas.tanggalSkPT}
                      onChange={e => setIdentitas(p => ({ ...p, tanggalSkPT: e.target.value }))}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Pejabat Penandatangan SK PT</label>
                    <input
                      className="form-input"
                      placeholder="Contoh: Menteri Pendidikan Nasional"
                      disabled={!canEdit}
                      value={identitas.pejabatSkPendirianPT}
                      onChange={e => setIdentitas(p => ({ ...p, pejabatSkPendirianPT: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Link / Lokasi Salinan SK Pendirian PT (Lampiran 1)</label>
                  <input
                    className="form-input"
                    placeholder="https://drive.google.com/... atau nama file arsip PDF"
                    disabled={!canEdit}
                    value={identitas.fileSkPendirianPT}
                    onChange={e => setIdentitas(p => ({ ...p, fileSkPendirianPT: e.target.value }))}
                  />
                </div>
              </div>

              <hr className="divider" style={{ margin: '20px 0' }} />

              {/* Sub: SK Pembukaan PS */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span className="badge badge-purple">SK Pembukaan PS (2)</span>
                  <span className="text-xs text-muted">* Wajib dilampirkan salinan SK</span>
                </div>
                <div className="form-row" style={{ marginBottom: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nomor SK Pembukaan PS</label>
                    <input
                      className="form-input"
                      placeholder="Nomor SK Izin Operasional / Pembukaan PS..."
                      disabled={!canEdit}
                      value={identitas.noSkPembukaanPS}
                      onChange={e => setIdentitas(p => ({ ...p, noSkPembukaanPS: e.target.value }))}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tanggal SK Pembukaan PS</label>
                    <input
                      type="date"
                      className="form-input"
                      disabled={!canEdit}
                      value={identitas.tanggalSkPS}
                      onChange={e => setIdentitas(p => ({ ...p, tanggalSkPS: e.target.value }))}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Pejabat Penandatangan SK PS</label>
                    <input
                      className="form-input"
                      placeholder="Contoh: Dirjen Pendidikan Tinggi / Rektor"
                      disabled={!canEdit}
                      value={identitas.pejabatSkPembukaanPS}
                      onChange={e => setIdentitas(p => ({ ...p, pejabatSkPembukaanPS: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Link / Lokasi Salinan SK Pembukaan PS (Lampiran 2)</label>
                  <input
                    className="form-input"
                    placeholder="https://drive.google.com/... atau nama file arsip PDF"
                    disabled={!canEdit}
                    value={identitas.fileSkPembukaanPS}
                    onChange={e => setIdentitas(p => ({ ...p, fileSkPembukaanPS: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Bagian 3: Status Akreditasi & Mahasiswa Pertama */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <IconBadge color="emerald" size="md">
                    <Award size={20} strokeWidth={1.75} />
                  </IconBadge>
                  <div>
                    <div className="card-title">3. Status Akreditasi PS & Penerimaan Mahasiswa</div>
                    <div className="card-subtitle">Peringkat akreditasi terbaru dari BAN-PT / LAM Teknik</div>
                  </div>
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: '18px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tahun Pertama Kali Menerima Mahasiswa</label>
                  <input
                    className="form-input"
                    placeholder="Contoh: 2005"
                    disabled={!canEdit}
                    value={identitas.tahunPertama}
                    onChange={e => setIdentitas(p => ({ ...p, tahunPertama: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Peringkat Terbaru Akreditasi PS (3)</label>
                  <select
                    className="form-select"
                    disabled={!canEdit}
                    value={identitas.peringkatAkreditasi}
                    onChange={e => setIdentitas(p => ({ ...p, peringkatAkreditasi: e.target.value }))}
                  >
                    <option value="Unggul">Unggul</option>
                    <option value="Baik Sekali">Baik Sekali</option>
                    <option value="Baik">Baik</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="Minimum">Minimum</option>
                    <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nomor SK BAN-PT / LAM</label>
                  <input
                    className="form-input"
                    placeholder="No. SK Akreditasi Terkini..."
                    disabled={!canEdit}
                    value={identitas.nomorSkAkreditasi}
                    onChange={e => setIdentitas(p => ({ ...p, nomorSkAkreditasi: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Link / Lokasi Salinan SK Akreditasi Terakhir (Lampiran 3)</label>
                <input
                  className="form-input"
                  placeholder="https://drive.google.com/... atau nama file arsip PDF"
                  disabled={!canEdit}
                  value={identitas.fileSkAkreditasi}
                  onChange={e => setIdentitas(p => ({ ...p, fileSkAkreditasi: e.target.value }))}
                />
              </div>
            </div>

            {/* Bagian 4: Pengesahan Pengusul & Tahun TS */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <IconBadge color="amber" size="md">
                    <UserCheck size={20} strokeWidth={1.75} />
                  </IconBadge>
                  <div>
                    <div className="card-title">4. Pengesahan Pengusul & Tahun TS (Tahun Akademik)</div>
                    <div className="card-subtitle">Data penandatangan usulan borang akreditasi prodi (Posisi Kanan Bawah Excel)</div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nama Pengusul (Pimpinan UPPS / Dekan) <span className="required">*</span></label>
                  <input
                    className="form-input"
                    placeholder="Contoh: Prof. Dr. Ir. Nama Dekan, M.T., IPU."
                    disabled={!canEdit}
                    value={identitas.namaPengusul}
                    onChange={e => setIdentitas(p => ({ ...p, namaPengusul: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tanggal Pengajuan (HH/BB/TTTT)</label>
                  <input
                    type="date"
                    className="form-input"
                    disabled={!canEdit}
                    value={identitas.tanggalPengusul}
                    onChange={e => setIdentitas(p => ({ ...p, tanggalPengusul: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tahun Akademik TS (HH/BB/TTTT / Tahun) <span className="required">*</span></label>
                  <input
                    className="form-input"
                    placeholder="Contoh: 2024/2025 atau 2024"
                    disabled={!canEdit}
                    value={identitas.tahunTS}
                    onChange={e => setIdentitas(p => ({ ...p, tahunTS: e.target.value }))}
                  />
                </div>
              </div>

              {/* Catatan Kaki Instrumen LAM Teknik */}
              <div
                style={{
                  marginTop: '20px',
                  padding: '14px 18px',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  border: '1px dashed var(--border-color)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Info size={14} /> Catatan Kaki Resmi Format Instrumen LAM-Teknik (Versi 1.0):
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>(1) Lampirkan salinan Surat Keputusan Pendirian Perguruan Tinggi.</li>
                  <li>(2) Lampirkan salinan Surat Keputusan Pembukaan Program Studi.</li>
                  <li>(3) Lampirkan salinan Surat Keputusan Akreditasi Program Studi terbaru.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Prodi di UPPS */}
        {activeTab === 'prodi' && (
          <div className="card animate-fade-in">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <IconBadge color="purple" size="md">
                  <School size={20} strokeWidth={1.75} />
                </IconBadge>
                <div>
                  <div className="card-title">Daftar Program Studi di bawah UPPS</div>
                  <div className="card-subtitle">Sheet &apos;PS&apos; – Data seluruh program studi dalam UPPS beserta status akreditasi & mahasiswa aktif</div>
                </div>
              </div>
              {canEdit && (
                <button id="btn-add-prodi" className="btn btn-primary btn-sm" onClick={addProdi}>
                  <Plus size={15} strokeWidth={2} />
                  Tambah Prodi
                </button>
              )}
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Program Studi</th>
                    <th>Jenjang</th>
                    <th>Peringkat Akreditasi</th>
                    <th>Jml. Mahasiswa Aktif (TS)</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {prodiList.map((prodi, idx) => (
                    <tr key={prodi.id}>
                      <td style={{ color: 'var(--text-muted)', width: '40px' }}>{idx + 1}</td>
                      <td className="input-cell">
                        <input placeholder="Nama Prodi..." value={prodi.namaProdi} disabled={!canEdit}
                          onChange={e => updateProdi(prodi.id, 'namaProdi', e.target.value)} />
                      </td>
                      <td className="input-cell" style={{ width: '100px' }}>
                        <select className="form-select" style={{ padding: '6px 10px', fontSize: '13px' }}
                          disabled={!canEdit}
                          value={prodi.jenjang} onChange={e => updateProdi(prodi.id, 'jenjang', e.target.value)}>
                          <option>S1</option><option>D3</option><option>D4</option>
                          <option>S2</option><option>S3</option>
                        </select>
                      </td>
                      <td className="input-cell" style={{ width: '180px' }}>
                        <select className="form-select" style={{ padding: '6px 10px', fontSize: '13px' }}
                          disabled={!canEdit}
                          value={prodi.peringkatAkreditasi} onChange={e => updateProdi(prodi.id, 'peringkatAkreditasi', e.target.value)}>
                          <option value="">-- Pilih --</option>
                          <option>Unggul</option><option>Baik Sekali</option><option>Baik</option>
                          <option>A</option><option>B</option><option>C</option><option>Belum Terakreditasi</option>
                        </select>
                      </td>
                      <td className="input-cell" style={{ width: '180px' }}>
                        <input type="number" min="0" value={prodi.jumlahMahasiswaAktif} disabled={!canEdit}
                          onChange={e => updateProdi(prodi.id, 'jumlahMahasiswaAktif', e.target.value)} />
                      </td>
                      <td style={{ width: '60px' }}>
                        {canEdit ? (
                          <button className="btn btn-danger btn-sm" onClick={() => removeProdi(prodi.id)}
                            disabled={prodiList.length === 1}>
                            <Trash2 size={14} strokeWidth={1.75} />
                          </button>
                        ) : (
                          <span className="text-xs text-muted">–</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Tim Penyusun */}
        {activeTab === 'tim' && (
          <div className="card animate-fade-in">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <IconBadge color="emerald" size="md">
                  <Users size={20} strokeWidth={1.75} />
                </IconBadge>
                <div>
                  <div className="card-title">Tim Penyusun Dokumen LKPS</div>
                  <div className="card-subtitle">Data anggota tim penyusun borang beserta jabatan dan peran</div>
                </div>
              </div>
              {canEdit && (
                <button id="btn-add-tim" className="btn btn-primary btn-sm" onClick={addTim}>
                  <Plus size={15} strokeWidth={2} />
                  Tambah Anggota
                </button>
              )}
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Lengkap & Gelar</th>
                    <th>NIDN</th>
                    <th>Jabatan dalam Tim</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {timList.map((t, idx) => (
                    <tr key={t.id}>
                      <td style={{ color: 'var(--text-muted)', width: '40px' }}>{idx + 1}</td>
                      <td className="input-cell">
                        <input placeholder="Nama lengkap & gelar..." value={t.nama} disabled={!canEdit}
                          onChange={e => updateTim(t.id, 'nama', e.target.value)} />
                      </td>
                      <td className="input-cell" style={{ width: '160px' }}>
                        <input placeholder="0012345678" value={t.nidn} disabled={!canEdit}
                          onChange={e => updateTim(t.id, 'nidn', e.target.value)} />
                      </td>
                      <td className="input-cell" style={{ width: '220px' }}>
                        <input placeholder="Ketua / Sekretaris / Anggota..." value={t.jabatan} disabled={!canEdit}
                          onChange={e => updateTim(t.id, 'jabatan', e.target.value)} />
                      </td>
                      <td style={{ width: '60px' }}>
                        {canEdit ? (
                          <button className="btn btn-danger btn-sm" onClick={() => removeTim(t.id)}
                            disabled={timList.length === 1}>
                            <Trash2 size={14} strokeWidth={1.75} />
                          </button>
                        ) : (
                          <span className="text-xs text-muted">–</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Save button */}
        {canEdit && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            {saved && (
              <div className="badge badge-emerald" style={{ fontSize: '13px', padding: '8px 14px' }}>
                <CheckCircle2 size={14} strokeWidth={2} />
                Data berhasil disimpan!
              </div>
            )}
            <button id="btn-save-identitas" className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="spin" size={16} strokeWidth={2} />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} strokeWidth={1.75} />
                  Simpan Seluruh Data Identitas
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </>
  )
}
