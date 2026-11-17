import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { canEditModule, getRoleErrorMessage } from '@/lib/permissions'
import { getActiveProdiId } from '@/lib/active-prodi'

export async function GET(req: Request) {
  try {
    const session = await auth()
    const activeProdiId = await getActiveProdiId(session, req)
    const whereClause: any = { jenis: 'PkM' }
    if (activeProdiId) {
      whereClause.prodiId = activeProdiId
    }

    const pkm = await prisma.penelitianDosen.findMany({
      where: whereClause,
      orderBy: { tahun: 'desc' },
    })
    return NextResponse.json(pkm)
  } catch (error) {
    console.error('API PkM GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch PkM data' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const role = session.user?.role
  if (!canEditModule(role, 'pkm')) {
    return NextResponse.json({ error: getRoleErrorMessage(role, 'pkm') }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { action, payload } = body

    if (action === 'save') {
      const { id, judul, namaDosen, mahasiswaTerlibat, tahun } = payload
      let res
      if (id && !id.startsWith('temp_')) {
        res = await prisma.penelitianDosen.update({
          where: { id },
          data: {
            judul,
            namaDosen,
            mahasiswaTerlibat,
            tahun: parseInt(tahun) || new Date().getFullYear(),
            jenis: 'PkM',
            prodiId: session.user?.prodiId || undefined,
          },
        })
      } else {
        res = await prisma.penelitianDosen.create({
          data: {
            judul,
            namaDosen,
            mahasiswaTerlibat,
            tahun: parseInt(tahun) || new Date().getFullYear(),
            jenis: 'PkM',
            prodiId: session.user?.prodiId || null,
          },
        })
      }
      return NextResponse.json(res)
    }

    if (action === 'delete') {
      await prisma.penelitianDosen.delete({ where: { id: payload.id } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('API PkM POST Error:', error)
    return NextResponse.json({ error: 'Failed to process PkM request' }, { status: 500 })
  }
}
