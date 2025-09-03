import { tProjectListQuery, tProjectPersisted } from "../@types/tProject";
import { IProjectServices } from "../interfaces/IProjectServices";

export async function fetchProjects(
  projectServices: IProjectServices,
  query?: tProjectListQuery
): Promise<tProjectPersisted[]> {
  return projectServices.findAll(query);
}

