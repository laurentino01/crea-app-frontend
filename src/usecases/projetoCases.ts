import {
  EtapaStatus,
  tProjectCreateDto,
  tProjectUpdateDto,
} from "@/@types/tProject";
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

export async function findByProjetoEStatus(
  projectService: IProjectServices,
  idProjeto: number,
  status: EtapaStatus
) {
  return await projectService.findByProjetoEStatus(idProjeto, status);
}

export async function updateInformacoes(
  projectService: IProjectServices,
  params: tProjectUpdateDto
) {
  return await projectService.updateInformacoes(params);
}
