import { tProjectPersisted, tIdUsuario } from "../@types/tProject";
import { IProjectServices } from "../interfaces/IProjectServices";

export async function removeProjectEquipeMember(
  projectServices: IProjectServices,
  projectId: string,
  userId: tIdUsuario
): Promise<tProjectPersisted> {
  return projectServices.removeEquipeMember(projectId, userId);
}

