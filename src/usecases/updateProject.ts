import { tProjectPersisted } from "../@types/tProject";
import { IProjectServices } from "../interfaces/IProjectServices";

export async function updateProject(
  projectServices: IProjectServices,
  id: string,
  changes: Partial<Omit<tProjectPersisted, "id">>
): Promise<tProjectPersisted> {
  return projectServices.update(id, changes);
}

