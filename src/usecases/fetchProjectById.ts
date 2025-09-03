import { tProjectPersisted } from "../@types/tProject";
import { IProjectServices } from "../interfaces/IProjectServices";

export async function fetchProjectById(
  projectServices: IProjectServices,
  id: string
): Promise<tProjectPersisted | null> {
  return projectServices.findById(id);
}

