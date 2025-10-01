import type { IProjectServices } from "@/interfaces/IProjectServices";
import type { tProjetoEtapa } from "@/@types/tProject";

export async function fetchProjectEtapas(
  projectServices: IProjectServices,
  projectId: string
): Promise<tProjetoEtapa[]> {
  return projectServices.getEtapas(projectId);
}
