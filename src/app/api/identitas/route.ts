import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

import { canEditModule, getRoleErrorMessage } from '@/lib/permissions'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const identitas = await prisma.identitasPT.findFirst()
  const prodiList = await prisma.prodi.findMany()
  const timList = await prisma.timPenyusun.findMany()

  return NextResponse.json({ identitas, prodiList, timList })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const role = session.user?.role
  if (!canEditModule(role, 'identitas')) {
    return NextResponse.json({ error: getRoleErrorMessage(role, 'identitas') }, { status: 403 })
  }

  const { identitas, prodiList, timList } = await req.json()

  // Upsert identitas PT
  await prisma.identitasPT.upsert({
    where: { id: 'default-pt' },
    update: {
      namaPT: identitas.namaPT,
      namaUPPS: identitas.namaUPPS,
      jenisProgram: identitas.jenisProgram,
      namaProdi: identitas.namaProdi,
      alamat: identitas.alamat,
      noSkPendirianPT: identitas.noSkPendirianPT,
      tanggalSkPT: identitas.tanggalSkPT ? new Date(identitas.tanggalSkPT) : null,
      noSkPembukaanPS: identitas.noSkPembukaanPS,
      tanggalSkPS: identitas.tanggalSkPS ? new Date(identitas.tanggalSkPS) : null,
    },
    create: {
      id: 'default-pt',
      namaPT: identitas.namaPT,
      namaUPPS: identitas.namaUPPS,
      jenisProgram: identitas.jenisProgram,
      namaProdi: identitas.namaProdi,
      alamat: identitas.alamat || '',
      noSkPendirianPT: identitas.noSkPendirianPT,
      tanggalSkPT: identitas.tanggalSkPT ? new Date(identitas.tanggalSkPT) : null,
      noSkPembukaanPS: identitas.noSkPembukaanPS,
      tanggalSkPS: identitas.tanggalSkPS ? new Date(identitas.tanggalSkPS) : null,
    },
  })

  // Recreate prodi list
  await prisma.prodi.deleteMany()
  for (const p of prodiList) {
    await prisma.prodi.create({
      data: {
        namaProdi: p.namaProdi || 'Prodi Baru',
        jenjang: p.jenjang || 'D3',
        peringkatAkreditasi: p.peringkatAkreditasi || null,
        jumlahMahasiswaAktif: parseInt(p.jumlahMahasiswaAktif) || 0,
      },
    })
  }

  // Recreate tim penyusun
  await prisma.timPenyusun.deleteMany()
  for (const t of timList) {
    if (t.nama) {
      await prisma.timPenyusun.create({
        data: {
          nama: t.nama,
          nidn: t.nidn || null,
          jabatan: t.jabatan || 'Anggota Tim',
        },
      })
    }
  }

  return NextResponse.json({ success: true })
}
