import {useCallback, useMemo, useState} from "react";
import type {EditorConfig} from "../logic/editorTypes.ts";
import {ALL_EDITORS} from "../logic/editorConfigs.ts";
import {designGuidesAroundMutation} from "../logic/guides.ts";
import {ALL_EDIT_REQUESTS, type EditRequestConfig} from "../logic/mutation.ts";

export function useBaseEditorDesigner () {
    const [DNASequence, setDNASequence] = useState<string>("CCTTGTTTTTTATGTAAGATGCCCCCCCCCTGG");
    const [error, setError] = useState<string>("");
    const [selectedEditorName, setSelectedEditorName] = useState<string>("ABE8e (SpCas9)");
    const [desiredEdit, setDesiredEdit] = useState<"A_TO_G" | "C_TO_T">("A_TO_G");
    const [guides, setGuides] = useState<string[]>([]);
    // TODO somehow substract 1
    const [mutationPos, setMutationPos] = useState<number | string | null>(15);
    const [targetStrand, setTargetStrand] = useState<"+" | "-">("+");
    const [seqvizHighlight, setSeqvizHighlight] = useState({});

    const editor: EditorConfig = useMemo(
        () => ALL_EDITORS.find((e) => e.name === selectedEditorName),
        [selectedEditorName]
    );

    const desiredEditObject: EditRequestConfig = useMemo(
        () => ALL_EDIT_REQUESTS.find((e) => e.name === desiredEdit ),
        [desiredEdit]
    );

    const analyse = useCallback(() => {
        designGuidesAroundMutation(DNASequence, 15, desiredEditObject, editor);
    }, [editor, DNASequence, mutationPos, desiredEdit]);

    const onSeqvizHighlight = useCallback(() => {

    }, []);

    return {
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
        // setSeqvizHighlight,
        // onSeqvizHighlight,
    }
}