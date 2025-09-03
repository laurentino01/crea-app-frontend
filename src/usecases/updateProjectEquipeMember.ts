import { tProjectPersisted, tIdUsuario } from "../@types/tProject";
import { IProjectServices } from "../interfaces/IProjectServices";

export async function updateProjectEquipeMember(
  projectServices: IProjectServices,
  projectId: string,
  oldUserId: tIdUsuario,
  newUserId: tIdUsuario
): Promise<tProjectPersisted> {
  return projectServices.updateEquipeMember(projectId, oldUserId, newUserId);
}

