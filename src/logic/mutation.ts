export interface EditRequestConfig {
    name: string;
    fromBase: "A" | "C";
    toBase: "G" | "T";
    targetPositions?: number[];
}

export const A_TO_G_EDIT_REQUEST: EditRequestConfig = {
    name: 'A_TO_G',
    fromBase: "A",
    toBase: "G",
    targetPositions: [],
}

export const C_TO_T_EDIT_REQUEST: EditRequestConfig = {
    name: 'C_TO_T',
    fromBase: "C",
    toBase: "T",
    targetPositions: [],
}

export const ALL_EDIT_REQUESTS: EditRequestConfig[] = [
    A_TO_G_EDIT_REQUEST,
    C_TO_T_EDIT_REQUEST,
];