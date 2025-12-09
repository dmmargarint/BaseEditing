export const IUPAC: Record<string, string> = {
    A: "A",
    C: "C",
    G: "G",
    T: "T",
    R: "[AG]",
    Y: "[CT]",
    S: "[GC]",
    W: "[AT]",
    K: "[GT]",
    M: "[AC]",
    B: "[CGT]",
    D: "[AGT]",
    H: "[ACT]",
    V: "[ACG]",
    N: "[ACGT]",
};

export const COMPLEMENT: Record<string, string> = {
    A: "T",
    C: "G",
    G: "C",
    T: "A",
    R: "Y",
    Y: "R",
    S: "S",
    W: "W",
    K: "M",
    M: "K",
    B: "V",
    D: "H",
    H: "D",
    V: "B",
    N: "N",
};


export function buildIupacRegex(pam: string): RegExp {
    const pattern = pam
        .toUpperCase()
        .split("")
        .map((c) => IUPAC[c] ?? c)
        .join("");
    return new RegExp(pattern, "g");
}

export function reverseComplementIupac(pam: string): string {
    return pam
        .toUpperCase()
        .split("")
        .reverse()
        .map((c) => COMPLEMENT[c] ?? c)
        .join("");
}

export function findReverseComplement(dnaSeq: string): string | null {
    if (dnaSeq.length === 0) {
        return null;
    }

    let revcomp = "";
    for (let i = dnaSeq.length - 1; i >= 0; i--) {
        revcomp += COMPLEMENT[dnaSeq.charAt(i)];
    }

    return revcomp;
}