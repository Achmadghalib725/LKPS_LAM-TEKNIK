import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, betterAuthInstance } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.user?.role;
  if (role !== "SUPER_ADMIN" && role !== "ADMIN_UPPS" && role !== "PENANGGUNG_JAWAB") {
    return NextResponse.json({ error: "Hanya Admin UPPS / Super Admin yang dapat mengakses manajemen pengguna" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      prodi: {
        select: {
          id: true,
          namaProdi: true,
          jenjang: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const prodiList = await prisma.prodi.findMany({
    select: { id: true, namaProdi: true, jenjang: true },
    orderBy: { namaProdi: "asc" },
  });

  return NextResponse.json({ users, prodiList });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userRole = session.user?.role;
  if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN_UPPS" && userRole !== "PENANGGUNG_JAWAB") {
    return NextResponse.json({ error: "Hanya Admin UPPS / Super Admin yang dapat mengelola akun pengguna" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, name, email, password, role, prodiId } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Nama, email, dan role wajib diisi" }, { status: 400 });
    }

    if (id) {
      const updateData: any = {
        name,
        email,
        role,
        prodiId: prodiId || null,
      };
      const updated = await prisma.user.update({
        where: { id },
        data: updateData,
        select: { id: true, name: true, email: true, role: true },
      });
      return NextResponse.json({ success: true, user: updated });
    } else {
      if (!password || password.trim() === "") {
        return NextResponse.json({ error: "Password wajib diisi untuk pengguna baru" }, { status: 400 });
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "Email sudah digunakan oleh akun lain" }, { status: 400 });
      }

      const res = await betterAuthInstance.api.signUpEmail({
        body: {
          name,
          email,
          password,
        },
      });

      if (res?.user?.id) {
        await prisma.user.update({
          where: { id: res.user.id },
          data: { role, prodiId: prodiId || null },
        });
      }

      return NextResponse.json({ success: true, user: res.user }, { status: 201 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal menyimpan data pengguna" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userRole = session.user?.role;
  if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN_UPPS" && userRole !== "PENANGGUNG_JAWAB") {
    return NextResponse.json({ error: "Hanya Admin UPPS / Super Admin yang dapat menghapus akun pengguna" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID pengguna tidak disertakan" }, { status: 400 });

    if (id === session.user?.id) {
      return NextResponse.json({ error: "Tidak dapat menghapus akun Anda sendiri yang sedang aktif" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal menghapus pengguna" }, { status: 500 });
  }
}
