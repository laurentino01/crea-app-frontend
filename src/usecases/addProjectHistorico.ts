import { tProjetoHistoricoItem } from "../@types/tProject";
import { IProjectServices } from "../interfaces/IProjectServices";

export async function addProjectHistorico(
  projectServices: IProjectServices,
  projectId: string,
  entry: Omit<tProjetoHistoricoItem, "idProjeto" | "data"> & { data?: Date }
): Promise<tProjetoHistoricoItem> {
  return projectServices.addHistorico(projectId, entry);
}

