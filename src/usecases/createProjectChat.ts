import { tChat } from "../@types/tProject";
import { IProjectServices } from "../interfaces/IProjectServices";

export async function createProjectChat(
  projectServices: IProjectServices,
  projectId: string,
  chat: Omit<tChat, "id" | "idProjeto">
): Promise<tChat> {
  return projectServices.createChat(projectId, chat);
}

