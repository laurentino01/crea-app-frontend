import { tProjectPersisted, tIdUsuario } from "../@types/tProject";
import { IProjectServices } from "../interfaces/IProjectServices";

export async function addProjectEquipeMember(
  projectServices: IProjectServices,
  projectId: string,
  userId: tIdUsuario
): Promise<tProjectPersisted> {
  return projectServices.addEquipeMember(projectId, userId);
}

