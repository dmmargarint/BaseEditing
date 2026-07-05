export interface GenomeConfig {
  name: string;
  code: string;
}

export const HOMO_SAPIENS_HG38: GenomeConfig = {
  name: "Homo sapiens - hg38",
  code: "homo_sapiens_hg38"
}

export const MUS_MUSCULUS_MM10: GenomeConfig = {
  name: "Mus musculus - mm10",
  code: "mus_musculus_mm10"
}

export const MUS_MUSCULUS_MM39: GenomeConfig = {
  name: "Mus musculus - mm39",
  code: "mus_musculus_mm39"
}

export const CELEGANS: GenomeConfig = {
  name: "Caenorhabditis elegans",
  code: "caenorhabditis_elegans_ce11"
}

export const DROSOPHILA_MELANOGASTER: GenomeConfig = {
  name: "Drosophila melanogaster dm6",
  code: "drosophila_melanogaster_dm6"
}

export const ALL_GENOMES: GenomeConfig[] = [
  HOMO_SAPIENS_HG38,
  MUS_MUSCULUS_MM10,
  MUS_MUSCULUS_MM39,
  CELEGANS,
  DROSOPHILA_MELANOGASTER
];