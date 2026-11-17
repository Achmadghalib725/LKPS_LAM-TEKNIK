import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const kriteria = await prisma.kriteriaConfig.findUnique({
      where: { id },
      include: {
        regulasi: true,
        tabelList: {
          orderBy: { nomorTabel: 'asc' },
        },
      },
    })

    if (!kriteria) {
      return NextResponse.json({ error: 'Kriteria tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(kriteria)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal memuat kriteria' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: kriteriaId } = await params
    const body = await req.json()
    const { action, payload } = body

    if (action === 'saveTableRows') {
      const { tabelId, rows, buktiList } = payload
      const tabel = await prisma.tabelConfig.findUnique({
        where: { id: tabelId },
      })

      if (!tabel) {
        return NextResponse.json({ error: 'Tabel tidak ditemukan' }, { status: 404 })
      }

      let parsedFormat: any = {}
      try {
        if (tabel.formatKolom) {
          parsedFormat = JSON.parse(tabel.formatKolom)
        }
      } catch {
        parsedFormat = { customRaw: tabel.formatKolom }
      }

      parsedFormat.rows = rows || []
      if (buktiList !== undefined) {
        parsedFormat.buktiList = buktiList
      }

      const updated = await prisma.tabelConfig.update({
        where: { id: tabelId },
        data: {
          formatKolom: JSON.stringify(parsedFormat),
        },
      })

      return NextResponse.json({ success: true, tabel: updated })
    }

    return NextResponse.json({ error: 'Aksi tidak didukung' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal menyimpan data tabel' }, { status: 500 })
  }
}
