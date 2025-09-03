import { tProjectPersisted, tIdUsuario } from "../@types/tProject";
import { IProjectServices } from "../interfaces/IProjectServices";

export async function changeProjectResponsible(
  projectServices: IProjectServices,
  projectId: string,
  novoResponsavelId: tIdUsuario
): Promise<tProjectPersisted> {
  return projectServices.changeResponsavel(projectId, novoResponsavelId);
}

