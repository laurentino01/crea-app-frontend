import type { tCriterioAvaliacao } from "@/@types/tAvaliacao";
import type { ICriteriaServices } from "@/interfaces/ICriteriaServices";
import { CRITERIOS_LS_KEY } from "@/lib/criterios.localstorage";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function getStoredCriterios(): tCriterioAvaliacao[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(CRITERIOS_LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as tCriterioAvaliacao[]) : [];
  } catch {
    return [];
  }
}

export class LocalStorageCriteriaService implements ICriteriaServices {
  async findAll(): Promise<tCriterioAvaliacao[]> {
    return getStoredCriterios();
  }
}

export const criteriaService = new LocalStorageCriteriaService();

