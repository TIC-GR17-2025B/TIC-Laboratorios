export const LogCategory = {
    ATAQUE: "ATAQUE",
    COMPRA: "COMPRA",
    INFO: "INFO"
} as const;

export type LogCategory = typeof LogCategory[keyof typeof LogCategory];
