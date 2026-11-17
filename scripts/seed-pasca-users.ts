import { prisma } from '../src/lib/prisma';
import { betterAuthInstance } from '../src/lib/auth';

interface ProdiDef {
  id: string;
  namaProdi: string;
  jenjang: string;
  operatorEmail: string;
  operatorName: string;
}

const PASCA_FT_UNILA_PRODI: ProdiDef[] = [
  // ── S2 (Magister) FT UNILA ──
  {
    id: 'prodi-s2-sipil',
    namaProdi: 'Magister Teknik Sipil',
    jenjang: 'S2',
    operatorEmail: 'operator.s2sipil@lkps.ac.id',
    operatorName: 'Operator Prodi Magister Teknik Sipil',
  },
  {
    id: 'prodi-s2-mesin',
    namaProdi: 'Magister Teknik Mesin',
    jenjang: 'S2',
    operatorEmail: 'operator.s2mesin@lkps.ac.id',
    operatorName: 'Operator Prodi Magister Teknik Mesin',
  },
  {
    id: 'prodi-s2-elektro',
    namaProdi: 'Magister Teknik Elektro',
    jenjang: 'S2',
    operatorEmail: 'operator.s2elektro@lkps.ac.id',
    operatorName: 'Operator Prodi Magister Teknik Elektro',
  },
  {
    id: 'prodi-s2-kimia',
    namaProdi: 'Magister Teknik Kimia',
    jenjang: 'S2',
    operatorEmail: 'operator.s2kimia@lkps.ac.id',
    operatorName: 'Operator Prodi Magister Teknik Kimia',
  },
  {
    id: 'prodi-s2-pwk',
    namaProdi: 'Magister Perencanaan Wilayah dan Kota',
    jenjang: 'S2',
    operatorEmail: 'operator.s2pwk@lkps.ac.id',
    operatorName: 'Operator Prodi Magister PWK',
  },
  // ── S3 (Doktor) FT UNILA ──
  {
    id: 'prodi-s3-teknik',
    namaProdi: 'Doktor Ilmu Teknik',
    jenjang: 'S3',
    operatorEmail: 'operator.s3teknik@lkps.ac.id',
    operatorName: 'Operator Prodi Doktor Ilmu Teknik',
  },
  {
    id: 'prodi-s3-sipil',
    namaProdi: 'Doktor Teknik Sipil',
    jenjang: 'S3',
    operatorEmail: 'operator.s3sipil@lkps.ac.id',
    operatorName: 'Operator Prodi Doktor Teknik Sipil',
  },
  // Profesi Insinyur (PPI)
  {
    id: 'prodi-profesi-insinyur',
    namaProdi: 'Program Profesi Insinyur',
    jenjang: 'Profesi',
    operatorEmail: 'operator.ppi@lkps.ac.id',
    operatorName: 'Operator Program Profesi Insinyur',
  },
];

async function seedPascaFTUsers() {
  console.log('--- Mulai Pembuatan Master Prodi & Akun Pascasarjana (S2, S3, Profesi) FT UNILA ---');
  const defaultPassword = 'password123';

  for (const item of PASCA_FT_UNILA_PRODI) {
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
        jumlahMahasiswaAktif: 85,
      },
    });

    const existingUser = await prisma.user.findUnique({
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
      console.log(`[Update] Akun: ${item.operatorEmail} sudah ada.`);
    }
  }

  console.log('--- Selesai. Password default: ' + defaultPassword + ' ---');
}

seedPascaFTUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
