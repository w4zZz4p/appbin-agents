interface ImportMetaEnv {
  /** Optional first-party analytics endpoint (P1). Empty = events stay on the device. */
  readonly VITE_BEACON_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
