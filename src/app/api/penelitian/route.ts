import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { canEditModule, getRoleErrorMessage } from '@/lib/permissions'

export async function GET() {
  try {
    const session = await auth()
    const role = session?.user?.role
    const userProdiId = session?.user?.prodiId

    const whereClause: any = { jenis: 'Penelitian' }
    if (role === 'OPERATOR_PRODI' && userProdiId) {
      whereClause.prodiId = userProdiId
    }

    const penelitian = await prisma.penelitianDosen.findMany({
      where: whereClause,
      orderBy: { tahun: 'desc' },
    })
    return NextResponse.json(penelitian)
  } catch (error) {
    console.error('API Penelitian GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch Penelitian data' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const role = session.user?.role
  if (!canEditModule(role, 'penelitian')) {
    return NextResponse.json({ error: getRoleErrorMessage(role, 'penelitian') }, { status: 403 })
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
            jenis: 'Penelitian',
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
            jenis: 'Penelitian',
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
    console.error('API Penelitian POST Error:', error)
    return NextResponse.json({ error: 'Failed to process Penelitian request' }, { status: 500 })
  }
}
