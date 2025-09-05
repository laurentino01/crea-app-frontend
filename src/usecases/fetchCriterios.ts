import type { tCriterioAvaliacao } from "@/@types/tAvaliacao";
import type { ICriteriaServices } from "@/interfaces/ICriteriaServices";

export async function fetchCriterios(
  criteriaServices: ICriteriaServices
): Promise<tCriterioAvaliacao[]> {
  return criteriaServices.findAll();
}

