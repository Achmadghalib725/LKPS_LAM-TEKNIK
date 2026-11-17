import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { canEditModule, getRoleErrorMessage } from '@/lib/permissions'
import { getActiveProdiId } from '@/lib/active-prodi'

export async function GET(req: Request) {
  try {
    const session = await auth()
    const activeProdiId = await getActiveProdiId(session, req)
    const whereClause: any = activeProdiId ? { prodiId: activeProdiId } : {}

    const dokumen = await prisma.dokumenSpmi.findMany({
      where: whereClause,
      orderBy: { jenisDokumen: 'asc' },
    })
    return NextResponse.json(dokumen)
  } catch (error) {
    console.error('API Penjaminan GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch Penjaminan data' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const role = session.user?.role
  if (!canEditModule(role, 'penjaminan')) {
    return NextResponse.json({ error: getRoleErrorMessage(role, 'penjaminan') }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { action, payload } = body

    if (action === 'saveDokumen') {
      const { rows } = payload
      for (const r of rows) {
        if (r.id && !r.id.startsWith('temp_')) {
          await prisma.dokumenSpmi.update({
            where: { id: r.id },
            data: {
              jenisDokumen: r.jenisDokumen,
              tersedia: Boolean(r.tersedia),
              fileDokumen: r.fileDokumen || null,
              keterangan: r.keterangan || '',
              prodiId: session.user?.prodiId || undefined,
            },
          })
        } else {
          await prisma.dokumenSpmi.create({
            data: {
              jenisDokumen: r.jenisDokumen,
              tersedia: Boolean(r.tersedia),
              fileDokumen: r.fileDokumen || null,
              keterangan: r.keterangan || '',
              prodiId: session.user?.prodiId || null,
            },
          })
        }
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('API Penjaminan POST Error:', error)
    return NextResponse.json({ error: 'Failed to process Penjaminan request' }, { status: 500 })
  }
}
