import type { IProjectServices } from "@/interfaces/IProjectServices";
import type { tProjectPersisted } from "@/@types/tProject";

export async function discontinueProject(
  projectServices: IProjectServices,
  projectId: string,
  motivo?: string
): Promise<tProjectPersisted> {
  return projectServices.setProjetoDescontinuado(projectId, motivo);
}

