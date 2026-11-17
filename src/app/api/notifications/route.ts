import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface NotifItem {
  id: string
  pesan: string
  tautan?: string | null
  dibaca: boolean
  createdAt: string
  kategori?: string
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Coba baca dari tabel PostgreSQL Pemberitahuan
    let dbNotifs: any[] = []
    try {
      dbNotifs = await prisma.$queryRaw<any[]>`
        SELECT id, pesan, tautan, dibaca, "createdAt"
        FROM "Pemberitahuan"
        ORDER BY "createdAt" DESC
        LIMIT 15
      `
    } catch {
      dbNotifs = []
    }

    if (dbNotifs.length > 0) {
      const items: NotifItem[] = dbNotifs.map((n) => ({
        id: String(n.id),
        pesan: String(n.pesan),
        tautan: n.tautan ? String(n.tautan) : null,
        dibaca: Boolean(n.dibaca),
        createdAt: new Date(n.createdAt).toISOString(),
        kategori: 'Sistem',
      }))
      return NextResponse.json({ notifications: items, unreadCount: items.filter((i) => !i.dibaca).length })
    }

    // Default sistem notifikasi jika tabel kosong
    const defaultNotifs: NotifItem[] = [
      {
        id: 'notif-1',
        pesan: 'Sinkronisasi One Data: Ekstraksi data SDM dan mahasiswa berhasil dipetakan ke borang LKPS.',
        tautan: '/import',
        dibaca: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        kategori: 'One Data',
      },
      {
        id: 'notif-2',
        pesan: 'Computation Engine: Skor prediksi akreditasi prodi telah diperbarui secara otomatis.',
        tautan: '/dashboard',
        dibaca: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        kategori: 'Akreditasi',
      },
      {
        id: 'notif-3',
        pesan: 'Pengingat Dokumen: Periksa kelengkapan file MoU/MoA pada Kriteria 1 Kerjasama.',
        tautan: '/kerjasama',
        dibaca: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        kategori: 'Dokumen',
      },
    ]

    return NextResponse.json({
      notifications: defaultNotifs,
      unreadCount: defaultNotifs.filter((i) => !i.dibaca).length,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Gagal mengambil notifikasi' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { id, markAllAsRead } = body

    try {
      if (markAllAsRead) {
        await prisma.$executeRaw`UPDATE "Pemberitahuan" SET dibaca = true`
      } else if (id) {
        await prisma.$executeRaw`UPDATE "Pemberitahuan" SET dibaca = true WHERE id = ${id}`
      }
    } catch {
      // Ignore if table has custom ID structure
    }

    return NextResponse.json({ success: true, message: 'Status notifikasi diperbarui' })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Gagal memperbarui notifikasi' },
      { status: 500 }
    )
  }
}
