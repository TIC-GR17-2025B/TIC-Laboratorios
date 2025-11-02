export const LogCategory = {
  ATAQUE: "ATAQUE",
  COMPRA: "COMPRA",
  INFO: "INFO",
  ADVERTENCIA: "ADVERTENCIA",
} as const;

export type LogCategory = (typeof LogCategory)[keyof typeof LogCategory];
