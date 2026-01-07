import {useCallback, useMemo, useState} from "react";
import type {EditorConfig} from "../logic/editorTypes.ts";
import {ALL_EDITORS} from "../logic/editorConfigs.ts";
import { designGuidesAroundMutation, type Guide } from '../logic/guides.ts';
import {ALL_EDIT_REQUESTS, type EditRequestConfig} from "../logic/mutation.ts";

export function useBaseEditorDesigner () {
    const [DNASequence, setDNASequence] = useState<string>("CCTTGTTTTTTATGTAATATGCCCCCCCCCTGGCCCTTGG");
    // const [DNASequence, setDNASequence] = useState<string>("CCTTGTTTTTTATGTAATATGCCCCCCCCCTGGCCTTGTTTTTTATGTAATATGCCCCCCCCCTGGCCTTGTTTTTTATGTAATATGCCCCCCCCCTGGCCTTGTTTTTTATGTAATATGCCCCCCCCCTGGCCTTGTTTTTTATGTAATATGCCCCCCCCCTGGCCTTGTTTTTTATGTAATATGCCCCCCCCCTGGCCTTGTTTTTTATGTAATATGCCCCCCCCCTGGCCTTGTTTTTTATGTAATATGCCCCCCCCCTGGCCTTGTTTTTTATGTAATATGCCCCCCCCCTGGCCTTGTTTTTTATGTAATATGCCCCCCCCCTGGCCTTGTTTTTTATGTAATATGCCCCCCCCCTGGCCTTGTTTTTTATGTAATATGCCCCCCCCCTGGCCTTGTTTTTTATGTAATATGCCCCCCCCCTGGCCTTGTTTTTTATGTAATATGCCCCCCCCCTGGCCTTGTTTTTTATGTAATATGCCCCCCCCCTGG");
    const [error, setError] = useState<string>("");
    const [selectedEditorName, setSelectedEditorName] = useState<string>("ABE8e (SpCas9)");
    const [desiredEdit, setDesiredEdit] = useState<"A_TO_G" | "C_TO_T">("A_TO_G");
    const [guides, setGuides] = useState<Guide[]>([]);
    // TODO  substract 1
    const [mutationPos, setMutationPos] = useState<number>(15);
    const [targetStrand, setTargetStrand] = useState<"+" | "-">("+");
    const [seqvizZoom, setSeqvizZoom] = useState<number>(11);
    // const [seqvizHighlight, setSeqvizHighlight] = useState({});

    const editor: EditorConfig = useMemo(
        () => ALL_EDITORS.find((e) => e.name === selectedEditorName),
        [selectedEditorName]
    );

    const desiredEditObject: EditRequestConfig = useMemo(
        () => ALL_EDIT_REQUESTS.find((e) => e.name === desiredEdit ),
        [desiredEdit]
    );

    const analyse = useCallback(() => {
        const guides: Guide [] = designGuidesAroundMutation(DNASequence, mutationPos, desiredEditObject, editor);
        setGuides(guides);

        console.log("Guides from useBaseEditorDesigner");
        console.log(guides);

    }, [editor, DNASequence, mutationPos, desiredEditObject]);

    const onSeqvizHighlight = useCallback(() => {
      console.log(guides);
    }, [guides]);

    // return {
    //     DNASequence,
    //     setDNASequence,
    //     selectedEditorName,
    //     setSelectedEditorName,
    //     desiredEdit,
    //     setDesiredEdit,
    //     error,
    //     setError,
    //     analyse,
    //     mutationPos,
    //     setMutationPos,
    //     targetStrand,
    //     setTargetStrand,
    //     guides,
    //     // setSeqvizHighlight,
    //     onSeqvizHighlight,
    // }
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
    onSeqvizHighlight,
    seqvizZoom,
    setSeqvizZoom
  }), [
    DNASequence, selectedEditorName, desiredEdit, error,
    analyse, mutationPos, targetStrand, guides, onSeqvizHighlight,
    seqvizZoom, setSeqvizZoom
  ]);
}