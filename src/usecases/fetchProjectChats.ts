import { tChat } from "../@types/tProject";
import { IProjectServices } from "../interfaces/IProjectServices";

export async function fetchProjectChats(
  projectServices: IProjectServices,
  projectId: string
): Promise<tChat[]> {
  return projectServices.getChats(projectId);
}

