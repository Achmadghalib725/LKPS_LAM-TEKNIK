import { prisma } from '../src/lib/prisma';

async function bersihkanDataDummyLama() {
  console.log('--- Memulai pembersihan seluruh data tabel kriteria (K1 s/d K9) ---');

  // Bersihkan tabel anak terlebih dahulu (foreign key)
  const bimbingan = await prisma.bimbinganTA.deleteMany();
  console.log(`Dihapus BimbinganTA: ${bimbingan.count}`);

  const ewmp = await prisma.eWMP.deleteMany();
  console.log(`Dihapus EWMP: ${ewmp.count}`);

  const luaranDosen = await prisma.luaranDosen.deleteMany();
  console.log(`Dihapus LuaranDosen: ${luaranDosen.count}`);

  const dosen = await prisma.dosenTetap.deleteMany();
  console.log(`Dihapus DosenTetap: ${dosen.count}`);

  const tendik = await prisma.tenagaKependidikan.deleteMany();
  console.log(`Dihapus TenagaKependidikan: ${tendik.count}`);

  const kerjasama = await prisma.kerjasama.deleteMany();
  console.log(`Dihapus Kerjasama: ${kerjasama.count}`);

  const seleksi = await prisma.seleksiMahasiswaBaru.deleteMany();
  console.log(`Dihapus SeleksiMahasiswaBaru: ${seleksi.count}`);

  const asing = await prisma.mahasiswaAsing.deleteMany();
  console.log(`Dihapus MahasiswaAsing: ${asing.count}`);

  const dana = await prisma.penggunaanDana.deleteMany();
  console.log(`Dihapus PenggunaanDana: ${dana.count}`);

  const lab = await prisma.laboratorium.deleteMany();
  console.log(`Dihapus Laboratorium: ${lab.count}`);

  const mk = await prisma.mataKuliah.deleteMany();
  console.log(`Dihapus MataKuliah: ${mk.count}`);

  const mbkm = await prisma.programMBKM.deleteMany();
  console.log(`Dihapus ProgramMBKM: ${mbkm.count}`);

  const penelitian = await prisma.penelitianDosen.deleteMany();
  console.log(`Dihapus PenelitianDosen: ${penelitian.count}`);

  const ipk = await prisma.ipkLulusan.deleteMany();
  console.log(`Dihapus IpkLulusan: ${ipk.count}`);

  const prestasi = await prisma.prestasiMahasiswa.deleteMany();
  console.log(`Dihapus PrestasiMahasiswa: ${prestasi.count}`);

  const efektivitas = await prisma.efektivitasStudi.deleteMany();
  console.log(`Dihapus EfektivitasStudi: ${efektivitas.count}`);

  const tracer = await prisma.tracerStudy.deleteMany();
  console.log(`Dihapus TracerStudy: ${tracer.count}`);

  const luaranMhs = await prisma.luaranMahasiswa.deleteMany();
  console.log(`Dihapus LuaranMahasiswa: ${luaranMhs.count}`);

  const spmi = await prisma.dokumenSpmi.deleteMany();
  console.log(`Dihapus DokumenSpmi: ${spmi.count}`);

  console.log('--- Seluruh data isi borang LKPS telah dibersihkan (kosong 100%) ---');
  console.log('Akun login pengguna, master program studi, dan regulasi template tetap utuh.');
}

bersihkanDataDummyLama()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
