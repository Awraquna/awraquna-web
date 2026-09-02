import type en from "./en";

/** Structural type of the EN dictionary; AR must provide the same keys. */
type DeepString<T> = { [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> };

export type Dictionary = DeepString<typeof en>;
