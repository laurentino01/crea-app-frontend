import { tProjetoHistoricoItem } from "../@types/tProject";
import { IProjectServices } from "../interfaces/IProjectServices";

export async function fetchProjectHistorico(
  projectServices: IProjectServices,
  projectId: string
): Promise<tProjetoHistoricoItem[]> {
  return projectServices.getHistorico(projectId);
}

