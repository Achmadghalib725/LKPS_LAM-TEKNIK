'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from '@/lib/auth-client'
import {
  LayoutDashboard,
  Building2,
  Handshake,
  Users,
  UserCheck,
  Wallet,
  BookOpen,
  FlaskConical,
  HeartHandshake,
  Award,
  ShieldCheck,
  FileSpreadsheet,
  UploadCloud,
  LogOut,
  GraduationCap,
  UserCog,
  SlidersHorizontal,
  Layers,
} from 'lucide-react'

const standardCriteriaItems = [
  { id: 1, href: '/kerjasama', label: 'Kriteria 1: Tata Pamong', icon: Handshake, color: 'blue', badge: '1' },
  { id: 2, href: '/mahasiswa', label: 'Kriteria 2: Mahasiswa', icon: Users, color: 'cyan', badge: '2' },
  { id: 3, href: '/sdm', label: 'Kriteria 3: SDM', icon: UserCheck, color: 'purple', badge: '3' },
  { id: 4, href: '/keuangan', label: 'Kriteria 4: Keuangan', icon: Wallet, color: 'emerald', badge: '4' },
  { id: 5, href: '/pendidikan', label: 'Kriteria 5: Pendidikan', icon: BookOpen, color: 'amber', badge: '5' },
  { id: 6, href: '/penelitian', label: 'Kriteria 6: Penelitian', icon: FlaskConical, color: 'pink', badge: '6' },
  { id: 7, href: '/pkm', label: 'Kriteria 7: PkM', icon: HeartHandshake, color: 'orange', badge: '7' },
  { id: 8, href: '/luaran', label: 'Kriteria 8: Luaran', icon: Award, color: 'teal', badge: '8' },
  { id: 9, href: '/penjaminan', label: 'Kriteria 9: SPMI', icon: ShieldCheck, color: 'indigo', badge: '9' },
]

interface CustomCriteriaNav {
  id: string
  nomorUrut: number
  kode: string
  nama: string
}

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role
  const isUPPS = userRole === 'ADMIN_UPPS' || userRole === 'SUPER_ADMIN' || userRole === 'PENANGGUNG_JAWAB'
  const isGuest = userRole === 'GUEST'

  const [customCriteriaList, setCustomCriteriaList] = useState<CustomCriteriaNav[]>([])

  useEffect(() => {
    // Ambil daftar kriteria dinamis untuk mendeteksi kriteria tambahan (Kriteria 10, dsb.)
    fetch('/api/konfigurasi', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.regulasiList?.length > 0) {
          const activeReg = data.regulasiList.find((r: any) => r.statusAktif) || data.regulasiList[0]
          const kriteria = activeReg?.kriteriaList || []
          // Ambil kriteria dengan nomorUrut > 9 atau yang belum ada di standard list
          const additional = kriteria.filter((k: any) => k.nomorUrut > 9 || !standardCriteriaItems.some(s => s.id === k.nomorUrut))
          setCustomCriteriaList(additional)
        }
      })
      .catch(() => {})
  }, [pathname])

  const dynamicCriteriaItems = [
    ...standardCriteriaItems,
    ...customCriteriaList.map((k) => ({
      id: k.nomorUrut,
      href: `/kriteria/${k.id}`,
      label: `${k.kode}: ${k.nama}`,
      icon: Layers,
      color: 'purple' as const,
      badge: String(k.nomorUrut),
    })),
  ]

  const totalCriteriaCount = dynamicCriteriaItems.length

  const allSections = isGuest
    ? [
        {
          section: 'Utama',
          items: [
            { href: '/dashboard', label: 'Dashboard Ringkasan', icon: LayoutDashboard, color: 'blue', badge: 'Guest' },
          ],
        },
      ]
    : [
        {
          section: 'Utama',
          items: [
            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'blue', badge: null },
          ],
        },
        {
          section: 'Identitas',
          items: [
            { href: '/identitas', label: 'Identitas & Tim', icon: Building2, color: 'blue', badge: null },
          ],
        },
        {
          section: `${totalCriteriaCount} Kriteria Akreditasi`,
          items: dynamicCriteriaItems,
        },
        {
          section: 'Data Ingestion & Ekspor',
          items: [
            { href: '/import', label: 'Import One Data', icon: UploadCloud, color: 'cyan', badge: 'OneData' },
            { href: '/export', label: 'Export Excel', icon: FileSpreadsheet, color: 'emerald', badge: null },
          ],
        },
        ...(isUPPS
          ? [
              {
                section: 'Pengaturan UPPS',
                items: [
                  { href: '/konfigurasi', label: 'Struktur Kriteria & Tabel', icon: SlidersHorizontal, color: 'blue', badge: 'UPPS' },
                  { href: '/admin', label: 'Manajemen Akun', icon: UserCog, color: 'purple', badge: 'Admin' },
                ],
              },
            ]
          : []),
      ]

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <GraduationCap size={18} strokeWidth={2} />
        </div>
        <div>
          <div className="logo-title">LKPS LAM Teknik</div>
          <div className="logo-subtitle">Sistem Akreditasi Prodi</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {allSections.map((section) => (
          <div key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className={`nav-icon-container nav-icon-${item.color}`}>
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`nav-badge nav-badge-${item.color}`}>{item.badge}</span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          id="btn-sidebar-logout"
          className="nav-item nav-item-logout"
          style={{ width: '100%', background: 'none', border: 'none', color: 'var(--accent-rose)' }}
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <span className="nav-icon-container nav-icon-rose">
            <LogOut size={16} strokeWidth={1.75} />
          </span>
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}
