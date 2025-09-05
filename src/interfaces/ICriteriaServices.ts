import type { tCriterioAvaliacao } from "@/@types/tAvaliacao";

export interface ICriteriaServices {
  // Retorna todos os critérios disponíveis
  findAll(): Promise<tCriterioAvaliacao[]>;
}

