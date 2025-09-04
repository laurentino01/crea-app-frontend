import type { IProjectServices } from "@/interfaces/IProjectServices";
import type { tProjectPersisted } from "@/@types/tProject";

export async function concludeProject(
  projectServices: IProjectServices,
  projectId: string
): Promise<tProjectPersisted> {
  return projectServices.setProjetoConcluido(projectId);
}

