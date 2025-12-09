import type {EditorConfig, PAMSite, Strand} from "./editorTypes.ts";
import {findPAMsForEditor} from "./pamScanner.ts";
import {COMPLEMENT} from "./sequenceUtils.ts";
import {extractProtospacerFromPam} from "./protospacer.ts";
import {detectMutationTargetStrand, type EditRequestConfig} from "./mutation.ts";

export type Guide = {

}

// TODO create type mutation, nr for now
// TODO create type guide
export function designGuidesAroundMutation(
    seq: string,
    mutation: number,
    // targetStrand: Strand,
    desiredEdit: EditRequestConfig,
    editor: EditorConfig
): Guide[] {

    let guides: Guide[] = [];

    // 1. Determine target strand using editor.targetBase
    // TODO decide how to approach the desired target strand vs actual
    let targetStrand : Strand = detectMutationTargetStrand(seq, mutation, desiredEdit, editor);
    console.log(targetStrand);
    // 2. Scan for PAMs using editor.pamPatterns
    let PAMs: PAMSite[] = findPAMsForEditor(seq, editor);
    console.log(PAMs);
    // 3. Extract protospacers of editor.guideLength

    let protospacers = [];
    PAMs.map((pam: PAMSite) => {
        let protospacer = extractProtospacerFromPam(seq, pam, editor);
        protospacers.push(protospacer);
    });

    console.log(protospacers);

    // 4. Handle PAM orientation (Cas9 vs Cas12a)
    // 5. Identify editable bases using editor.activityWindows
    // 6. Identify bystanders based on editor.targetBase
    // 7. Score guides, return sorted list



    return guides;
}