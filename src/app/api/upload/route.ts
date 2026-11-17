import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Berkas tidak ditemukan' }, { status: 400 })
    }

    // Validasi tipe berkas (hanya PDF dan dokumen pendukung)
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.xlsx']
    const ext = path.extname(file.name).toLowerCase()
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: 'Format berkas tidak diizinkan. Harap unggah berkas PDF/Gambar/Excel.' },
        { status: 400 }
      )
    }

    // Maksimal 10MB
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Ukuran berkas melebihi batas 10MB.' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'bukti')
    await fs.mkdir(uploadDir, { recursive: true })

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const finalFilename = `${Date.now()}_${safeName}`
    const filePath = path.join(uploadDir, finalFilename)

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    const fileUrl = `/uploads/bukti/${finalFilename}`

    return NextResponse.json({
      success: true,
      message: 'Berkas bukti fisik berhasil diunggah',
      url: fileUrl,
      fileName: file.name,
      size: file.size,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Gagal mengunggah berkas' },
      { status: 500 }
    )
  }
}
