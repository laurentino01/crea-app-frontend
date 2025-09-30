import { tProjectCreateDto } from "@/@types/tProject";
import { IProjectServices } from "@/interfaces/IProjectServices";

export async function create(
  projectService: IProjectServices,
  projectCreateDto: tProjectCreateDto
) {
  return await projectService.create(projectCreateDto);
}

export async function findById(
  projectService: IProjectServices,
  idProjeto: number
) {
  return await projectService.findById(idProjeto);
}
export async function findEquipe(
  projectService: IProjectServices,
  idProjeto: number
) {
  return await projectService.findEquipe(idProjeto);
}
