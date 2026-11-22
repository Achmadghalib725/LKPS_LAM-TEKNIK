'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import IconBadge from '@/components/IconBadge'
import { FileSpreadsheet, FileText, Download, RefreshCw, CheckCircle2, ArrowRight, Share2, Printer, ExternalLink } from 'lucide-react'

export default function ExportPage() {
  const [downloading, setDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [syncingLed, setSyncingLed] = useState(false)
  const [syncLedSuccess, setSyncLedSuccess] = useState<string | null>(null)

  const handleDownload = async () => {
    setDownloading(true)
    setDownloadSuccess(false)
    try {
      const res = await fetch('/api/export')
      if (!res.ok) throw new Error('Gagal mengunduh file ekspor')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `LKPS_LAM_Teknik_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      setDownloadSuccess(true)
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat ekspor')
    } finally {
      setDownloading(false)
    }
  }

  const handleSyncToLed = async () => {
    setSyncingLed(true)
    setSyncLedSuccess(null)
    try {
      const res = await fetch('/api/sync-led', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proyekId: 'proyek-default' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim data ke LED')

      setSyncLedSuccess(data.message)
    } catch (err: any) {
      alert(err.message || 'Gagal sinkronisasi ke sistem LED')
    } finally {
      setSyncingLed(false)
    }
  }

  return (
    <>
      <Header title="Ekspor & Integrasi Dokumen" subtitle="Ekspor / Sinkronisasi" />
      <div className="page-content animate-fade-in">
        <div style={{ marginBottom: '24px' }}>
          <h2 className="section-title">Ekspor & Pratinjau Dokumen LKPS</h2>
          <p className="section-subtitle">
            Pilih format keluaran LKPS: unduh lembar kerja Excel (.xlsx), cetak dokumen naskah laporan PDF (.pdf), atau sinkronkan data ke modul LED LAM Teknik.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* Card 1: Ekspor Excel */}
          <div className="card" style={{ textAlign: 'center', padding: '36px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <IconBadge color="emerald" size="xl" glow style={{ margin: '0 auto 16px' }}>
                <FileSpreadsheet size={28} strokeWidth={1.75} />
              </IconBadge>
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
                Berkas Excel (.xlsx)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                Format baku spreadsheet <strong>LKPS_Akademik_Vokasi-1.xlsx</strong> dengan formula skor otomatis aktif siap diunggah ke portal LAM Teknik.
              </p>
            </div>

            <div>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn btn-primary"
                style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', padding: '10px 18px' }}
              >
                {downloading ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} strokeWidth={2} />}
                {downloading ? 'Membuat File...' : 'Unduh LKPS (.xlsx)'}
              </button>

              {downloadSuccess && (
                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--accent-emerald)', fontSize: '13px' }}>
                  <CheckCircle2 size={16} />
                  <span>File Excel berhasil diunduh!</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Cetak / Unduh Dokumen PDF Resmi */}
          <div className="card" style={{ textAlign: 'center', padding: '36px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(2, 132, 199, 0.35)', background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.04), rgba(59, 130, 246, 0.04))' }}>
            <div>
              <IconBadge color="blue" size="xl" glow style={{ margin: '0 auto 16px' }}>
                <FileText size={28} strokeWidth={1.75} color="#0284c7" />
              </IconBadge>
              <div style={{ display: 'inline-block', marginBottom: '6px' }}>
                <span className="badge badge-blue" style={{ fontSize: '11px' }}>SESUAI PANDUAN LAM TEKNIK</span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
                Dokumen Laporan PDF (.pdf)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                Naskah cetak formal lengkap: <strong>Halaman Muka</strong>, <strong>Identitas Pengusul</strong>, <strong>Lembar Pengesahan Tim Penyusun</strong> dengan kotak tanda tangan, dan <strong>Tabel 1 s.d. 9</strong>.
              </p>
            </div>

            <div>
              <a
                href="/export/cetak"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  padding: '10px 18px',
                  backgroundColor: '#0284c7',
                }}
              >
                <Printer size={16} strokeWidth={2} />
                <span>Lihat & Cetak PDF</span>
                <ExternalLink size={14} style={{ opacity: 0.7 }} />
              </a>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
                Buka pratinjau A4 & simpan langsung sebagai PDF
              </div>
            </div>
          </div>

          {/* Card 3: Sinkronisasi ke LED */}
          <div className="card" style={{ textAlign: 'center', padding: '36px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(79,142,247,0.06))', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div>
              <IconBadge color="purple" size="xl" glow style={{ margin: '0 auto 16px' }}>
                <Share2 size={28} strokeWidth={1.75} color="#8b5cf6" />
              </IconBadge>
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
                Kirim ke Sistem LED
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                Kirim berkas LKPS terkomputasi langsung ke modul <strong>LED (Laporan Evaluasi Diri)</strong> untuk pengisian narasi dan matriks penilaian.
              </p>
            </div>

            <div>
              <button
                onClick={handleSyncToLed}
                disabled={syncingLed}
                className="btn btn-primary"
                style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', padding: '10px 18px', background: '#8b5cf6' }}
              >
                {syncingLed ? <RefreshCw size={16} className="animate-spin" /> : <ArrowRight size={16} strokeWidth={2} />}
                {syncingLed ? 'Mengirim ke LED...' : 'Sinkronkan ke LED'}
              </button>

              {syncLedSuccess && (
                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--accent-emerald)', fontSize: '13px' }}>
                  <CheckCircle2 size={16} />
                  <span>{syncLedSuccess}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
