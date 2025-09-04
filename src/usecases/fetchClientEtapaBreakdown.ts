import { IProjectServices } from "@/interfaces/IProjectServices";
import {
  ProjetoEtapa,
  tProjectPersisted,
} from "@/@types/tProject";

export type tEtapaBreakdown = Partial<Record<ProjetoEtapa, number>> & {
  total: number;
};

export async function fetchClientEtapaBreakdown(
  projectServices: IProjectServices,
  clientId: string
): Promise<tEtapaBreakdown> {
  const projects: tProjectPersisted[] = await projectServices.findAll({
    cliente: clientId,
  });

  const counts: Partial<Record<ProjetoEtapa, number>> = {};
  for (const p of projects) {
    counts[p.etapa] = (counts[p.etapa] ?? 0) + 1;
  }

  return {
    ...counts,
    total: projects.length,
  };
}

