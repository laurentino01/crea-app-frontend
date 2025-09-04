import type { IProjectServices } from "@/interfaces/IProjectServices";
import type { tProjetoEtapaItem } from "@/@types/tProject";

export async function fetchProjectEtapas(
  projectServices: IProjectServices,
  projectId: string
): Promise<tProjetoEtapaItem[]> {
  return projectServices.getEtapas(projectId);
}

