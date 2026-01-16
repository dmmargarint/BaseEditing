import {useCallback, useMemo, useState} from "react";
import type {EditorConfig} from "../logic/editorTypes.ts";
import {ALL_EDITORS} from "../logic/editorConfigs.ts";
import { designGuidesAroundMutation, type Guide } from '../logic/guides.ts';
import {ALL_EDIT_REQUESTS, type EditRequestConfig} from "../logic/mutation.ts";

interface DesignerProps {
  onAnalyseComplete?: () => void; // Optional callback to reset state
}

export function useBaseEditorDesigner ({onAnalyseComplete}: DesignerProps = {}) {

    const [DNASequence, setDNASequence] = useState<string>("CCTTGTTTTTTATGTAATATGCCCCCCCCCTGGCCCTTGG");
    const [error, setError] = useState<string>("");
    const [selectedEditorName, setSelectedEditorName] = useState<string>("ABE8e (SpCas9)");
    const [desiredEdit, setDesiredEdit] = useState<"A_TO_G" | "C_TO_T">("A_TO_G");
    const [guides, setGuides] = useState<Guide[]>([]);
    const [mutationPos, setMutationPos] = useState<number>(16);
    const [targetStrand, setTargetStrand] = useState<"+" | "-">("+");
    const [seqvizZoom, setSeqvizZoom] = useState<number>(11);

    const editor: EditorConfig = useMemo(
        () => ALL_EDITORS.find((e) => e.name === selectedEditorName),
        [selectedEditorName]
    );

    const desiredEditObject: EditRequestConfig = useMemo(
        () => ALL_EDIT_REQUESTS.find((e) => e.name === desiredEdit ),
        [desiredEdit]
    );

    const analyse = useCallback(() => {
        // zero base
        const absMutationPos: number = mutationPos - 1;
        const guides: Guide [] = designGuidesAroundMutation(DNASequence, absMutationPos, desiredEditObject, editor);
        setGuides(guides);

        console.log("Guides from useBaseEditorDesigner");
        console.log(guides);

      if (onAnalyseComplete) {
        onAnalyseComplete();
      }

    }, [editor, DNASequence, mutationPos, desiredEditObject, onAnalyseComplete]);

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
    setSeqvizZoom
  }), [
    DNASequence, selectedEditorName, desiredEdit, error,
    analyse, mutationPos, targetStrand, guides,
    seqvizZoom, setSeqvizZoom
  ]);
}