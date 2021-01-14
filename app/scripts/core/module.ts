module ngApp.core {
}

angular
.module("ngApp.core", [
  "core.controller",
  "core.directives",
  "core.services",
  "core.filters"
]);
// DOLLEY: These constants were used by functions in the following files, 
// but those functions were not used: 
//    participants.controller.ts and projects.controller.ts  

// Original constants (for HMP)
// .constant('DATA_TYPES', {
//   GEQ: { full: "Gene Expression Quantification", abbr: "GEQ" },
// })
// .constant('DATA_CATEGORIES', {
//   SIXTEENR: { full: "16s_raw_seq_set", abbr: "16S-R" },
//   SIXTEENT: { full: "16s_trimmed_seq_set", abbr: "16S-T" },
//   BIOM: { full: "abundance_matrix", abbr: "BIOM" },
//   ANNO: { full: "annotation", abbr: "ANNO" },
//   CYTOKINE: { full: "cytokine", abbr: "CYTO" },
//   HTRSS: { full: "host_transcriptomics_raw_seq_set", abbr: "H-T" },
//   HWRSS: { full: "host_wgs_raw_seq_set", abbr: "H-WGS-R" },
//   LIPIDOME: { full: "lipidome", abbr: "LIPI" },
//   METABOLOME: { full: "metabolome", abbr: "METAB" },
//   MTRSS: { full: "microb_transcriptomics_raw_seq_set", abbr: "M-T" },
//   WASS: { full: "wgs_assembled_seq_set", abbr: "WGS-A" },
//   WRSS: { full: "wgs_raw_seq_set", abbr: "WGS-R" },
// });

// NeMO Portal:
// .constant('DATA_TYPES', {
//   GEQ: { full: "Gene Expression Quantification", abbr: "GEQ" },
// })
// .constant('DATA_CATEGORIES', {
//   TRANS: { full: "Transcriptome", abbr: "TRANS" },
//   GENOME: { full: "Genome", abbr: "GENOME" },
//   CHROM: { full: "Chromatin", abbr: "CHROM" },
//   METHYL: { full: "Methylation", abbr: "METHYL" },
//   //PROJ: { full: "projection", abbr: "PROJ" }
// });
