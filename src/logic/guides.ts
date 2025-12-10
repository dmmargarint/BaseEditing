import type {EditorConfig, PAMSite, Strand} from "./editorTypes.ts";
import {findPAMsForEditor} from "./pamScanner.ts";
import {COMPLEMENT, findReverseComplement} from "./sequenceUtils.ts";
import {extractProtospacerFromPam, type Protospacer} from "./protospacer.ts";
import {detectMutationTargetStrand, type EditRequestConfig} from "./mutation.ts";

export type Guide = {

}

// TODO create type mutation, nr for now
// TODO create type guide
export function designGuidesAroundMutation(
    seq: string,
    mutationPos0: number,
    // targetStrand: Strand,
    desiredEdit: EditRequestConfig,
    editor: EditorConfig
): Guide[] {

    let guides: Guide[] = [];

    // 1. Determine target strand using editor.targetBase
    // TODO decide how to approach the desired target strand vs actual
    let targetStrand : Strand = detectMutationTargetStrand(seq, mutationPos0, desiredEdit, editor);
    console.log(targetStrand);

    // 2. Scan for PAMs using editor.pamPatterns
    let PAMs: PAMSite[] = findPAMsForEditor(seq, editor);
    console.log("PAMs:");
    console.log(PAMs);

    // 3. Extract protospacers of editor.guideLength
    let protospacers: Protospacer[] = [];
    PAMs.map((pam: PAMSite) => {
        let protospacer = extractProtospacerFromPam(seq, pam, editor);
        protospacers.push(protospacer);
    });
    console.log("Protospacers:");
    console.log(protospacers);


    // TODO should I check the 5Prime vs 3Prime PAM direction
    protospacers.map((protospacer: Protospacer) => {
        const protStart = protospacer.start;
        const protEnd = protospacer.end;
        if (protospacer.pam.strand === "+") {

            let lowerLimit = protStart + editor.activityWindows.from;
            let upperLimit = protStart + editor.activityWindows.to;

            if (mutationPos0 >= lowerLimit && mutationPos0 <= upperLimit) {
                let revcomp = findReverseComplement(protospacer.sequence);
                guides.push({
                    guideStrand: "-",
                    guideSequence: revcomp,
                    length: revcomp?.length
                });
            }
        } else {
            // TODO explain why
            let lowerLimit = protEnd - editor.activityWindows.to;
            let upperLimit = protEnd - editor.activityWindows.from;

            if (mutationPos0 >= lowerLimit && mutationPos0 <= upperLimit) {
                let revcomp = findReverseComplement(protospacer.sequence);
                guides.push({
                    guideStrand: "+",
                    guideSequence: revcomp,
                    length: revcomp?.length
                });
            }
        }
    });

    console.log("Guides:");
    console.log(guides);


    // 5. Identify editable bases using editor.activityWindows
    // 6. Identify bystanders based on editor.targetBase
    // 7. Score guides, return sorted list



    return guides;
}