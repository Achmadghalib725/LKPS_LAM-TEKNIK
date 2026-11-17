'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import IconBadge from '@/components/IconBadge'
import { FileSpreadsheet, Download, RefreshCw, CheckCircle2, ArrowRight, Share2 } from 'lucide-react'

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
          <h2 className="section-title">Ekspor & Sinkronisasi Borang LKPS</h2>
          <p className="section-subtitle">
            Unduh berkas LKPS format baku LAM Teknik (.xlsx) atau kirimkan data secara otomatis ke sistem penyusunan Laporan Evaluasi Diri (LED).
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', maxWidth: '960px', margin: '0 auto' }}>
          {/* Card Ekspor Excel */}
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <IconBadge color="emerald" size="xl" glow style={{ margin: '0 auto 16px' }}>
              <FileSpreadsheet size={28} strokeWidth={1.75} />
            </IconBadge>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Unduh Berkas Excel (.xlsx)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 auto 20px', lineHeight: 1.6 }}>
              Mengisi otomatis data ke lembar kerja format baku <strong>LKPS_Akademik_Vokasi-1.xlsx</strong> siap diajukan ke LAM Teknik.
            </p>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 20px' }}
            >
              {downloading ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} strokeWidth={2} />}
              {downloading ? 'Membuat File...' : 'Unduh LKPS (.xlsx)'}
            </button>

            {downloadSuccess && (
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--accent-emerald)', fontSize: '13px' }}>
                <CheckCircle2 size={16} />
                <span>File LKPS berhasil diunduh!</span>
              </div>
            )}
          </div>

          {/* Card Sinkronisasi ke LED */}
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px', background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(79,142,247,0.06))', border: '1px solid rgba(139,92,246,0.2)' }}>
            <IconBadge color="purple" size="xl" glow style={{ margin: '0 auto 16px' }}>
              <Share2 size={28} strokeWidth={1.75} color="#8b5cf6" />
            </IconBadge>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Kirim ke Sistem LED LAM Teknik
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 auto 20px', lineHeight: 1.6 }}>
              Kirim berkas LKPS terkomputasi langsung ke modul <strong>LED (Laporan Evaluasi Diri)</strong> untuk narasi dan matriks penilaian otomatis.
            </p>

            <button
              onClick={handleSyncToLed}
              disabled={syncingLed}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 20px', background: '#8b5cf6' }}
            >
              {syncingLed ? <RefreshCw size={16} className="animate-spin" /> : <ArrowRight size={16} strokeWidth={2} />}
              {syncingLed ? 'Mengirim ke LED...' : 'Sinkronkan ke Sistem LED'}
            </button>

            {syncLedSuccess && (
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--accent-emerald)', fontSize: '13px' }}>
                <CheckCircle2 size={16} />
                <span>{syncLedSuccess}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

