export interface GenomeConfig {
  name: string;
  code: string;
  chroms: string[];
}

const MOUSE_CHROMS = [
  ...Array.from({ length: 19 }, (_, i) => `chr${i + 1}`),
  'chrX', 'chrY', 'chrM',
];

export const HOMO_SAPIENS_HG38: GenomeConfig = {
  name: "H. sapiens (hg38)",
  code: "homo_sapiens_hg38",
  chroms: [
    ...Array.from({ length: 22 }, (_, i) => `chr${i + 1}`),
    'chrX', 'chrY', 'chrM',
  ],
}

export const MUS_MUSCULUS_MM10: GenomeConfig = {
  name: "M. musculus (mm10)",
  code: "mus_musculus_mm10",
  chroms: MOUSE_CHROMS,
}

export const MUS_MUSCULUS_MM39: GenomeConfig = {
  name: "M. musculus (mm39)",
  code: "mus_musculus_mm39",
  chroms: MOUSE_CHROMS,
}

export const CELEGANS: GenomeConfig = {
  name: "C. elegans (ce11)",
  code: "caenorhabditis_elegans_ce11",
  chroms: ['chrI', 'chrII', 'chrIII', 'chrIV', 'chrV', 'chrX', 'chrM'],
}

export const DROSOPHILA_MELANOGASTER: GenomeConfig = {
  name: "D. melanogaster (dm6)",
  code: "drosophila_melanogaster_dm6",
  chroms: ['chr2L', 'chr2R', 'chr3L', 'chr3R', 'chr4', 'chrX', 'chrY', 'chrM'],
}

export const ALL_GENOMES: GenomeConfig[] = [
  HOMO_SAPIENS_HG38,
  // MUS_MUSCULUS_MM10,
  MUS_MUSCULUS_MM39,
  CELEGANS,
  DROSOPHILA_MELANOGASTER
];
