import { useCallback, useMemo, useState } from 'react';
import type {EditorConfig} from "../logic/editorTypes.ts";
import {ALL_EDITORS} from "../logic/editorConfigs.ts";
import { designGuidesAroundMutation, type Guide } from '../logic/guides.ts';
import {ALL_EDIT_REQUESTS, type EditRequestConfig} from "../logic/mutation.ts";
import { fasta } from "bioinformatics-parser";
import { useAnalysis } from '../logic/context/AnalysisContext.tsx';
import { ALL_GENOMES, type GenomeConfig } from '../logic/genomeConfigs.ts';

interface DesignerProps {
  onAnalyseComplete?: () => void;
}

export function useBaseEditorDesigner ({onAnalyseComplete}: DesignerProps = {}) {
    // const [DNASequence, setDNASequence] = useState<string>("TACCAGGCGTTCCTGGAGAACATGGAGCGATCAGACCCCCTGGGCTTCAGGGGATCAGAGG");
    const [DNASequence, setDNASequence] = useState<string>("");
    const [genome, setGenome] = useState<string>("hg38");
    const [error, setError] = useState<string>("");
    const [selectedEditorName, setSelectedEditorName] = useState<string>("auto");
    const [desiredEdit, setDesiredEdit] = useState<"A_TO_G" | "C_TO_T">("A_TO_G");
    const [guides, setGuides] = useState<Guide[]>([]);
    const [analysedOnce, setAnalysedOnce] = useState<boolean>(false);
    const [mutationPos, setMutationPos] = useState<number>(33);
    const [targetStrand, setTargetStrand] = useState<"+" | "-">("+");
    const [seqvizZoom, setSeqvizZoom] = useState<number>(11);

    const { startAnalysis, results } = useAnalysis();

    const reset = useCallback(() => {
      setGuides([]);
      setAnalysedOnce(false);
    }, [setGuides]);

    const editor: EditorConfig | "auto" = useMemo(
        () => {
          if(selectedEditorName === "auto") return "auto";
          return ALL_EDITORS.find((e) => e.name === selectedEditorName) ?? "auto";
        },
        [selectedEditorName]
    );

    const desiredEditObject: EditRequestConfig = useMemo(
        () => ALL_EDIT_REQUESTS.find((e) => e.name === desiredEdit) ?? ALL_EDIT_REQUESTS[0],
        [desiredEdit]
    );

    const genomeObject: GenomeConfig = useMemo(
      () => ALL_GENOMES.find((e) => e.code === genome) ?? ALL_GENOMES[0],
      [genome]
    );

    const analyse = useCallback(async () => {
        const absMutationPos: number = mutationPos - 1;
        const guides: Guide [] = designGuidesAroundMutation(
          DNASequence,
          absMutationPos,
          desiredEditObject,
          editor
        );

        setGuides(guides);
        setAnalysedOnce(true);

        if (guides.length > 0) {
          await startAnalysis(guides, genomeObject);
        }

      if (onAnalyseComplete) {
        onAnalyseComplete();
      }

    }, [mutationPos, DNASequence, desiredEditObject, editor, onAnalyseComplete, startAnalysis, genomeObject]);

    const enrichedGuides = useMemo(() => {
      return guides.map((guide: Guide) => ({
        ...guide,
        analysis: results?.[guide.guideSeq],
      }));
    }, [guides, results]);

    const onFastaFileUpload = (e: React.ChangeEvent<HTMLInputElement>) =>  {
      const file = e.target.files?.[0];

      if (!file) return;

      let fileText: string | ArrayBuffer | null = null;

      const reader = new FileReader();
      reader.onload = (ev) => {
        fileText = ev.target?.result as string;

        const {error, result} = fasta.parse(fileText);

        if (error) {
          setError('Could not parse FASTA file. Make sure it is a valid .fasta or .fa file.');
          return;
        }

        setDNASequence(result[0].data ?? "");
        setError('');
      }

      reader.onerror = () => {
        setError('Could not read the file. Please try again.');
      }
      reader.readAsText(file);
    }

  return useMemo(() => ({
    DNASequence,
    setDNASequence,
    selectedEditorName,
    setSelectedEditorName,
    desiredEdit,
    setDesiredEdit,
    error,
    setError,
    analyse,
    mutationPos,
    setMutationPos,
    targetStrand,
    setTargetStrand,
    guides,
    seqvizZoom,
    setSeqvizZoom,
    onFastaFileUpload,
    genome,
    setGenome,
    enrichedGuides,
    analysedOnce,
    reset
  }), [
    DNASequence, selectedEditorName, desiredEdit, error,
    analyse, mutationPos, targetStrand, guides, analysedOnce,
    seqvizZoom, setSeqvizZoom, onFastaFileUpload, genome,
    setGenome, enrichedGuides, reset
  ]);
}
