import type { IProjectServices } from "@/interfaces/IProjectServices";
import type { ProjetoEtapa, tProjetoEtapaItem } from "@/@types/tProject";

export async function updateProjectEtapaItem(
  projectServices: IProjectServices,
  projectId: string,
  etapa: ProjetoEtapa,
  changes: Partial<Omit<tProjetoEtapaItem, "id" | "idProjeto" | "etapa">>
) {
  return projectServices.updateEtapaItem(projectId, etapa, changes);
}

