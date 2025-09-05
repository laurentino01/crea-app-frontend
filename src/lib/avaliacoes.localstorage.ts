// Chaves e helpers para avaliações/pontuações no localStorage

export const AVALIACOES_LS_KEY = "crea.avaliacoes.v1";
export const PONTUACOES_LS_KEY = "crea.pontuacoes.v1";

export const EVENT_AVALIACAO_UPDATED = "avaliacao-updated";
export const EVENT_PONTUACAO_UPDATED = "pontuacao-updated";

export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function broadcast(eventName: string, detail?: unknown) {
  if (!isBrowser()) return;
  try {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  } catch {}
}

