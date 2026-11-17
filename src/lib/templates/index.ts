// Template Baku Regulasi, Kriteria & Tabel LKPS LAM Teknik

export * from "./types";
export { kriteria1TataPamong } from "./kriteria-1-tata-pamong";
export { kriteria2Mahasiswa } from "./kriteria-2-mahasiswa";
export { kriteria3SDM } from "./kriteria-3-sdm";
export { kriteria4Keuangan } from "./kriteria-4-keuangan";
export { kriteria5Pendidikan } from "./kriteria-5-pendidikan";
export { kriteria6Penelitian } from "./kriteria-6-penelitian";
export { kriteria7PkM } from "./kriteria-7-pkm";
export { kriteria8Luaran } from "./kriteria-8-luaran";
export { kriteria9SPMI } from "./kriteria-9-penjaminan";

import { kriteria1TataPamong } from "./kriteria-1-tata-pamong";
import { kriteria2Mahasiswa } from "./kriteria-2-mahasiswa";
import { kriteria3SDM } from "./kriteria-3-sdm";
import { kriteria4Keuangan } from "./kriteria-4-keuangan";
import { kriteria5Pendidikan } from "./kriteria-5-pendidikan";
import { kriteria6Penelitian } from "./kriteria-6-penelitian";
import { kriteria7PkM } from "./kriteria-7-pkm";
import { kriteria8Luaran } from "./kriteria-8-luaran";
import { kriteria9SPMI } from "./kriteria-9-penjaminan";
import type { KriteriaTemplateDef } from "./types";

export const LAM_TEKNIK_2024_TEMPLATE: KriteriaTemplateDef[] = [
  kriteria1TataPamong,
  kriteria2Mahasiswa,
  kriteria3SDM,
  kriteria4Keuangan,
  kriteria5Pendidikan,
  kriteria6Penelitian,
  kriteria7PkM,
  kriteria8Luaran,
  kriteria9SPMI,
];
