'use client'

import { Printer, Download } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        backgroundColor: '#0284c7',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 16px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 2px 6px rgba(2, 132, 199, 0.4)',
      }}
    >
      <Printer size={16} />
      <span>Cetak / Simpan sebagai PDF</span>
    </button>
  )
}
