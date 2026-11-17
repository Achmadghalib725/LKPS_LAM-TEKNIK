import { auth } from '@/lib/auth'
import Header from '@/components/Header'
import IconBadge from '@/components/IconBadge'
import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import {
  Layers,
  CheckCircle2,
  Edit3,
  Clock,
  Handshake,
  Users,
  UserCheck,
  Wallet,
  BookOpen,
  FlaskConical,
  HeartHandshake,
  Award,
  ShieldCheck,
  Sparkles,
  Lock,
  Zap,
  FileSpreadsheet,
  HelpCircle,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard – LKPS LAM Teknik',
  description: 'Pantau progres pengisian data akreditasi LKPS seluruh kriteria.',
}

export const dynamic = 'force-dynamic'

const standardCriteriaList = [
  {
    id: 1,
    href: '/kerjasama',
    name: 'Tata Pamong, Tata Kelola & Kerjasama',
    desc: 'Data kerjasama institusional (N1/N2/N3)',
    icon: Handshake,
    colorName: 'blue' as const,
    color: '#4f8ef7',
    bgColor: 'rgba(79,142,247,0.12)',
    progress: 0,
  },
  {
    id: 2,
    href: '/mahasiswa',
    name: 'Mahasiswa',
    desc: 'Seleksi mahasiswa baru TS s/d TS-4',
    icon: Users,
    colorName: 'cyan' as const,
    color: '#06b6d4',
    bgColor: 'rgba(6,182,212,0.12)',
    progress: 0,
  },
  {
    id: 3,
    href: '/sdm',
    name: 'Sumber Daya Manusia',
    desc: 'Profil DTPS, EWMP, luaran dosen',
    icon: UserCheck,
    colorName: 'purple' as const,
    color: '#8b5cf6',
    bgColor: 'rgba(139,92,246,0.12)',
    progress: 0,
  },
  {
    id: 4,
    href: '/keuangan',
    name: 'Keuangan, Sarana & Prasarana',
    desc: 'Penggunaan dana & data laboratorium',
    icon: Wallet,
    colorName: 'emerald' as const,
    color: '#10b981',
    bgColor: 'rgba(16,185,129,0.12)',
    progress: 0,
  },
  {
    id: 5,
    href: '/pendidikan',
    name: 'Pendidikan',
    desc: 'Kurikulum, RPS, dan program MBKM',
    icon: BookOpen,
    colorName: 'amber' as const,
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.12)',
    progress: 0,
  },
  {
    id: 6,
    href: '/penelitian',
    name: 'Penelitian',
    desc: 'Pelibatan mahasiswa dalam penelitian dosen',
    icon: FlaskConical,
    colorName: 'pink' as const,
    color: '#ec4899',
    bgColor: 'rgba(236,72,153,0.12)',
    progress: 0,
  },
  {
    id: 7,
    href: '/pkm',
    name: 'Pengabdian kepada Masyarakat',
    desc: 'Pelibatan mahasiswa dalam PkM dosen',
    icon: HeartHandshake,
    colorName: 'orange' as const,
    color: '#f97316',
    bgColor: 'rgba(249,115,22,0.12)',
    progress: 0,
  },
  {
    id: 8,
    href: '/luaran',
    name: 'Luaran dan Capaian Tridharma',
    desc: 'IPK, prestasi, tracer study, luaran mahasiswa',
    icon: Award,
    colorName: 'teal' as const,
    color: '#14b8a6',
    bgColor: 'rgba(20,184,166,0.12)',
    progress: 0,
  },
  {
    id: 9,
    href: '/penjaminan',
    name: 'Sistem Penjaminan Mutu Internal',
    desc: 'Dokumen SPMI, AMI, dan siklus PPEPP',
    icon: ShieldCheck,
    colorName: 'indigo' as const,
    color: '#6366f1',
    bgColor: 'rgba(99,102,241,0.12)',
    progress: 0,
  },
]

function ProgressRing({ percent, color }: { percent: number; color: string }) {
  const r = 22
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ

  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" stroke="var(--border-color)" strokeWidth="4" />
      <circle
        cx="28" cy="28" r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x="28" y="33" textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>
        {percent}%
      </text>
    </svg>
  )
}

export default async function DashboardPage() {
  const session = await auth()
  const user = session?.user as any
  const role = user?.role
  const userProdiId = user?.prodiId

  const filterWhere = role === 'OPERATOR_PRODI' && userProdiId ? { prodiId: userProdiId } : {}

  // 1. Hitung progres riil per kriteria dari basis data
  // Kriteria 1: Kerjasama
  const countKerjasama = await prisma.kerjasama.count({ where: filterWhere })
  const progK1 = countKerjasama > 0 ? 100 : 0

  // Kriteria 2: Mahasiswa (PMB)
  const countPmb = await prisma.seleksiMahasiswaBaru.count({ where: filterWhere })
  const countMhsAsing = await prisma.mahasiswaAsing.count({ where: filterWhere })
  const progK2 = countPmb > 0 ? (countMhsAsing > 0 ? 100 : 70) : 0

  // Kriteria 3: SDM (DTPS, EWMP, Bimbingan TA, Luaran Dosen, Tendik)
  const countDtps = await prisma.dosenTetap.count({ where: filterWhere })
  const countEwmp = await prisma.eWMP.count({
    where: role === 'OPERATOR_PRODI' && userProdiId ? { dosen: { prodiId: userProdiId } } : {},
  })
  const countBimbingan = await prisma.bimbinganTA.count({
    where: role === 'OPERATOR_PRODI' && userProdiId ? { dosen: { prodiId: userProdiId } } : {},
  })
  const countLuaranDosen = await prisma.luaranDosen.count({ where: filterWhere })
  const countTendik = await prisma.tenagaKependidikan.count({ where: filterWhere })
  let progK3Parts = 0
  if (countDtps > 0) progK3Parts += 40
  if (countLuaranDosen > 0) progK3Parts += 30
  if (countEwmp > 0) progK3Parts += 10
  if (countBimbingan > 0) progK3Parts += 10
  if (countTendik > 0) progK3Parts += 10
  const progK3 = Math.min(100, progK3Parts)

  // Kriteria 4: Keuangan & Sarana
  const countDana = await prisma.penggunaanDana.count({ where: filterWhere })
  const countLab = await prisma.laboratorium.count({ where: filterWhere })
  const progK4 = (countDana > 0 ? 50 : 0) + (countLab > 0 ? 50 : 0)

  // Kriteria 5: Pendidikan & Kurikulum
  const countMk = await prisma.mataKuliah.count({ where: filterWhere })
  const countMbkm = await prisma.programMBKM.count({ where: filterWhere })
  const progK5 = countMk > 0 ? (countMbkm > 0 ? 100 : 80) : 0

  // Kriteria 6: Penelitian Dosen
  const countPenelitian = await prisma.penelitianDosen.count({
    where: { ...filterWhere, jenis: 'Penelitian' },
  })
  const progK6 = countPenelitian > 0 ? 100 : 0

  // Kriteria 7: PkM Dosen
  const countPkm = await prisma.penelitianDosen.count({
    where: { ...filterWhere, jenis: 'PkM' },
  })
  const progK7 = countPkm > 0 ? 100 : 0

  // Kriteria 8: Luaran Tridharma (IPK, Prestasi, Masa Studi, Tracer)
  const countIpk = await prisma.ipkLulusan.count({ where: filterWhere })
  const countPrestasi = await prisma.prestasiMahasiswa.count({ where: filterWhere })
  const countEfektivitas = await prisma.efektivitasStudi.count({ where: filterWhere })
  const countTracer = await prisma.tracerStudy.count({ where: filterWhere })
  let progK8Parts = 0
  if (countIpk > 0) progK8Parts += 25
  if (countPrestasi > 0) progK8Parts += 25
  if (countEfektivitas > 0) progK8Parts += 25
  if (countTracer > 0) progK8Parts += 25
  const progK8 = Math.min(100, progK8Parts)

  // Kriteria 9: SPMI
  const countSpmi = await prisma.dokumenSpmi.count({
    where: { ...filterWhere, tersedia: true },
  })
  const progK9 = Math.min(100, Math.round((countSpmi / 5) * 100))

  const progressByKriteriaId: Record<number, number> = {
    1: progK1,
    2: progK2,
    3: progK3,
    4: progK4,
    5: progK5,
    6: progK6,
    7: progK7,
    8: progK8,
    9: progK9,
  }

  // Ambil regulasi aktif beserta seluruh kriteria yang terdaftar di database
  const activeReg = await prisma.regulasiLKPS.findFirst({
    where: { statusAktif: true },
    include: {
      kriteriaList: {
        orderBy: { nomorUrut: 'asc' },
        include: { tabelList: true },
      },
    },
  })

  const dbKriteria = activeReg?.kriteriaList || []

  // Tambahkan kriteria custom (nomorUrut > 9 atau yang belum ada di daftar standard)
  const additionalKriteria = dbKriteria.filter(
    (k) => k.nomorUrut > 9 || !standardCriteriaList.some((s) => s.id === k.nomorUrut)
  )

  const dynamicCriteriaList = [
    ...standardCriteriaList.map((s) => ({
      ...s,
      progress: progressByKriteriaId[s.id] ?? 0,
    })),
    ...additionalKriteria.map((k) => ({
      id: k.nomorUrut,
      href: `/kriteria/${k.id}`,
      name: k.nama,
      desc: k.deskripsi || `${k.tabelList?.length || 0} tabel instrumen kriteria kustom`,
      icon: Layers,
      colorName: 'purple' as const,
      color: '#8b5cf6',
      bgColor: 'rgba(139,92,246,0.12)',
      progress: 0,
      isCustom: true,
    })),
  ]

  const totalKriteriaCount = dynamicCriteriaList.length
  const sumProgress = dynamicCriteriaList.reduce((acc, c) => acc + c.progress, 0)
  const overallProgress = totalKriteriaCount > 0 ? Math.round(sumProgress / totalKriteriaCount) : 0

  const kriteriaSelesaiCount = dynamicCriteriaList.filter((c) => c.progress >= 100).length
  const kriteriaSedangDiisiCount = dynamicCriteriaList.filter((c) => c.progress > 0 && c.progress < 100).length
  const kriteriaBelumDimulaiCount = dynamicCriteriaList.filter((c) => c.progress === 0).length

  const statCards = [
    { label: 'Total Kriteria', value: String(totalKriteriaCount), icon: Layers, colorName: 'blue' as const, color: '#4f8ef7' },
    { label: 'Kriteria Selesai', value: String(kriteriaSelesaiCount), icon: CheckCircle2, colorName: 'emerald' as const, color: '#10b981' },
    { label: 'Sedang Diisi', value: String(kriteriaSedangDiisiCount), icon: Edit3, colorName: 'amber' as const, color: '#f59e0b' },
    { label: 'Belum Dimulai', value: String(kriteriaBelumDimulaiCount), icon: Clock, colorName: 'rose' as const, color: '#f43f5e' },
  ]

  return (
    <>
      <Header title="Dashboard" subtitle="Overview" />
      <div className="page-content animate-fade-in">

        {/* Welcome banner */}
        {user?.role === 'GUEST' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(59,130,246,0.08) 100%)',
            border: '1px solid rgba(6,182,212,0.25)',
            borderRadius: 'var(--radius-xl)',
            padding: '20px 24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <IconBadge color="cyan" size="lg">
              <Sparkles size={24} />
            </IconBadge>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Mode Tamu (Guest SSO Kampus) – Ringkasan Fakultas Teknik
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Anda memiliki akses peninjauan ringkasan status akreditasi dan kinerja instrumen program studi di lingkungan fakultas.
              </div>
            </div>
          </div>
        )}

        {user?.role === 'ASESOR' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(234,88,12,0.08) 100%)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 'var(--radius-xl)',
            padding: '20px 24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <IconBadge color="amber" size="lg">
              <ShieldCheck size={24} />
            </IconBadge>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Mode Reviewer Internal (Auditor Mutu) – Peninjauan & Simulasi Skor
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Hak akses Anda bersifat Read-Only untuk meninjau kecukupan butir penilaian dan memeriksa hasil kalkulasi otomatis akreditasi.
              </div>
            </div>
          </div>
        )}

        <div style={{
          background: 'linear-gradient(135deg, rgba(79,142,247,0.12) 0%, rgba(139,92,246,0.08) 100%)',
          border: '1px solid rgba(79,142,247,0.2)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 32px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800 }}>
                Selamat datang, {user?.name ?? 'Pengguna'}!
              </h1>
              <IconBadge color="amber" size="sm">
                <Sparkles size={16} strokeWidth={2} />
              </IconBadge>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Pantau dan kelola pengisian data LKPS untuk akreditasi LAM Teknik {activeReg?.tahunAkademik ? `(${activeReg.tahunAkademik})` : ''}.
              Semua data tersimpan secara otomatis.
            </p>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '42px', fontWeight: 800, background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {overallProgress}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Progres Keseluruhan</div>
            <div className="progress-bar-container" style={{ marginTop: '8px', width: '120px' }}>
              <div className="progress-bar-fill" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid-4" style={{ marginBottom: '28px' }}>
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="stat-card">
                <IconBadge color={stat.colorName} size="md" style={{ marginBottom: '16px' }}>
                  <Icon size={20} strokeWidth={1.75} />
                </IconBadge>
                <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* Section title */}
        {user?.role !== 'GUEST' && (
          <>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h2 className="section-title">{totalKriteriaCount} Kriteria Akreditasi</h2>
                <p className="section-subtitle">
                  Klik pada kartu kriteria untuk mulai mengisi data. Data yang sudah tersimpan
                  akan ditampilkan sebagai progres.
                </p>
              </div>
              {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_UPPS' || user?.role === 'OPERATOR_PRODI') && (
                <Link href="/konfigurasi" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                  <Layers size={14} />
                  <span>Kelola Kriteria & Tabel</span>
                </Link>
              )}
            </div>

            {/* Criteria Cards Grid */}
            <div className="criteria-grid">
              {dynamicCriteriaList.map((c: any) => {
                const Icon = c.icon
                return (
                  <Link key={c.id} href={c.href} className="criteria-card">
                    <div className="criteria-number" style={{ background: c.bgColor, color: c.color }}>
                      <Icon size={20} strokeWidth={1.75} />
                    </div>
                    <div className="criteria-info">
                      <div className="criteria-name">
                        K{c.id}: {c.name}
                        {c.isCustom && (
                          <span className="badge badge-purple" style={{ marginLeft: '6px', fontSize: '10px' }}>Kustom</span>
                        )}
                      </div>
                      <div className="criteria-desc">{c.desc}</div>
                      <div style={{ marginTop: '10px' }}>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: `${c.progress}%` }} />
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {c.progress}% selesai
                        </div>
                      </div>
                    </div>
                    <ProgressRing percent={c.progress} color={c.color} />
                  </Link>
                )
              })}
            </div>
          </>
        )}

        {user?.role === 'GUEST' && (
          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Ringkasan Status Akreditasi Program Studi Fakultas Teknik</div>
                <div className="card-subtitle">Pemantauan borang dan hasil komputasi mandiri (SSO Kampus)</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '12px' }}>
              {[
                { prodi: 'S1 Arsitektur', jenjang: 'Sarjana', skor: '331.7', status: 'Baik Sekali', terpenuhi: false },
                { prodi: 'S1 Teknik Sipil', jenjang: 'Sarjana', skor: '345.0', status: 'Unggul', terpenuhi: true },
                { prodi: 'S1 Teknik Mesin', jenjang: 'Sarjana', skor: '320.4', status: 'Baik Sekali', terpenuhi: true },
                { prodi: 'S1 Teknik Elektro', jenjang: 'Sarjana', skor: '352.8', status: 'Unggul', terpenuhi: true },
                { prodi: 'S1 Teknik Kimia', jenjang: 'Sarjana', skor: '315.2', status: 'Baik', terpenuhi: true },
                { prodi: 'S1 Teknik Geofisika', jenjang: 'Sarjana', skor: '310.0', status: 'Baik', terpenuhi: true },
              ].map((p, i) => (
                <div key={i} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '10px', background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>{p.prodi}</span>
                    <span className="badge badge-blue" style={{ fontSize: '10px' }}>{p.jenjang}</span>
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Simulasi Skor</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-blue)' }}>{p.skor}</div>
                    </div>
                    <span className={`badge ${p.status === 'Unggul' ? 'badge-emerald' : 'badge-amber'}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info card */}
        <div className="card" style={{ marginTop: '28px' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <IconBadge color="blue" size="md">
                <HelpCircle size={20} strokeWidth={1.75} />
              </IconBadge>
              <div>
                <div className="card-title">Petunjuk Pengisian LKPS</div>
                <div className="card-subtitle">Berdasarkan instrumen LAM Teknik untuk Diploma III / Sarjana Terapan</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '13.5px' }}>
            {[
              {
                icon: Lock,
                color: 'purple' as const,
                title: 'Hak Akses Sistem',
                desc: 'Admin UPPS memiliki otoritas penuh. Operator Prodi mengelola pengisian borang. Asesor & Guest bersifat Read-Only.'
              },
              {
                icon: Zap,
                color: 'amber' as const,
                title: 'Kalkulasi Otomatis',
                desc: 'Sistem menghitung rumus RK, RMD, PDTT, dan skor masa studi secara real-time.'
              },
              {
                icon: FileSpreadsheet,
                color: 'emerald' as const,
                title: 'Ekspor Excel',
                desc: 'Setelah semua data terisi, gunakan fitur Ekspor untuk menghasilkan file LKPS format LAM Teknik.'
              },
            ].map((tip) => {
              const TipIcon = tip.icon
              return (
                <div key={tip.title} style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  border: '1px solid var(--border-color)',
                }}>
                  <IconBadge color={tip.color} size="sm" style={{ marginBottom: '12px' }}>
                    <TipIcon size={18} strokeWidth={1.75} />
                  </IconBadge>
                  <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>{tip.title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12.5px', lineHeight: 1.6 }}>{tip.desc}</div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </>
  )
}
