import { prisma } from '../src/lib/prisma';
import { betterAuthInstance } from '../src/lib/auth';

interface ProdiDef {
  id: string;
  namaProdi: string;
  jenjang: string;
  operatorEmail: string;
  operatorName: string;
}

const FT_UNILA_PRODI: ProdiDef[] = [
  {
    id: 'prodi-s1-arsitektur',
    namaProdi: 'S1 Arsitektur',
    jenjang: 'S1',
    operatorEmail: 'operator.arsitektur@lkps.ac.id',
    operatorName: 'Operator Prodi S1 Arsitektur',
  },
  {
    id: 'prodi-s1-sipil',
    namaProdi: 'S1 Teknik Sipil',
    jenjang: 'S1',
    operatorEmail: 'operator.sipil@lkps.ac.id',
    operatorName: 'Operator Prodi S1 Teknik Sipil',
  },
  {
    id: 'prodi-s1-mesin',
    namaProdi: 'S1 Teknik Mesin',
    jenjang: 'S1',
    operatorEmail: 'operator.mesin@lkps.ac.id',
    operatorName: 'Operator Prodi S1 Teknik Mesin',
  },
  {
    id: 'prodi-s1-elektro',
    namaProdi: 'S1 Teknik Elektro',
    jenjang: 'S1',
    operatorEmail: 'operator.elektro@lkps.ac.id',
    operatorName: 'Operator Prodi S1 Teknik Elektro',
  },
  {
    id: 'prodi-s1-kimia',
    namaProdi: 'S1 Teknik Kimia',
    jenjang: 'S1',
    operatorEmail: 'operator.kimia@lkps.ac.id',
    operatorName: 'Operator Prodi S1 Teknik Kimia',
  },
  {
    id: 'prodi-s1-geofisika',
    namaProdi: 'S1 Teknik Geofisika',
    jenjang: 'S1',
    operatorEmail: 'operator.geofisika@lkps.ac.id',
    operatorName: 'Operator Prodi S1 Teknik Geofisika',
  },
  {
    id: 'prodi-s1-informatika',
    namaProdi: 'S1 Teknik Informatika',
    jenjang: 'S1',
    operatorEmail: 'operator.informatika@lkps.ac.id',
    operatorName: 'Operator Prodi S1 Teknik Informatika',
  },
  {
    id: 'prodi-s1-geodesi',
    namaProdi: 'S1 Teknik Geodesi',
    jenjang: 'S1',
    operatorEmail: 'operator.geodesi@lkps.ac.id',
    operatorName: 'Operator Prodi S1 Teknik Geodesi',
  },
  {
    id: 'prodi-d3-survei',
    namaProdi: 'D3 Teknik Survei dan Pemetaan',
    jenjang: 'D3',
    operatorEmail: 'operator.d3survei@lkps.ac.id',
    operatorName: 'Operator Prodi D3 Teknik Survei dan Pemetaan',
  },
  {
    id: 'prodi-d3-mesin-ft',
    namaProdi: 'D3 Teknik Mesin',
    jenjang: 'D3',
    operatorEmail: 'operator.d3mesin@lkps.ac.id',
    operatorName: 'Operator Prodi D3 Teknik Mesin',
  },
  {
    id: 'prodi-d3-sipil',
    namaProdi: 'D3 Teknik Sipil',
    jenjang: 'D3',
    operatorEmail: 'operator.d3sipil@lkps.ac.id',
    operatorName: 'Operator Prodi D3 Teknik Sipil',
  },
];

async function seedFTUsers() {
  console.log('--- Mulai Pembuatan Data Master Prodi & Akun Operator Fakultas Teknik UNILA ---');
  const defaultPassword = 'password123';

  for (const item of FT_UNILA_PRODI) {
    // 1. Upsert Prodi
    const prodi = await prisma.prodi.upsert({
      where: { id: item.id },
      update: {
        namaProdi: item.namaProdi,
        jenjang: item.jenjang,
      },
      create: {
        id: item.id,
        namaProdi: item.namaProdi,
        jenjang: item.jenjang,
        peringkatAkreditasi: 'Unggul',
        jumlahMahasiswaAktif: 250,
      },
    });

    // 2. Cek apakah user sudah ada
    let existingUser = await prisma.user.findUnique({
      where: { email: item.operatorEmail },
    });

    if (!existingUser) {
      try {
        const res = await betterAuthInstance.api.signUpEmail({
          body: {
            name: item.operatorName,
            email: item.operatorEmail,
            password: defaultPassword,
          },
        });
        if (res?.user?.id) {
          await prisma.user.update({
            where: { id: res.user.id },
            data: {
              role: 'OPERATOR_PRODI',
              prodiId: prodi.id,
            },
          });
          console.log(`[Dibuat] Akun: ${item.operatorEmail} -> ${item.namaProdi}`);
        }
      } catch (err: any) {
        console.error(`Gagal membuat ${item.operatorEmail}:`, err.message);
      }
    } else {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: 'OPERATOR_PRODI',
          prodiId: prodi.id,
          name: item.operatorName,
        },
      });
      console.log(`[Update] Akun: ${item.operatorEmail} sudah ada, relasi prodi diperbarui.`);
    }
  }

  console.log('--- Selesai. Password default semua operator: ' + defaultPassword + ' ---');
}

seedFTUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
