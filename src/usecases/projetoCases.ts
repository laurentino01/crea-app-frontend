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

export async function removeMembroEquipe(
  projectService: IProjectServices,
  params: {
    idProjeto: number;
    usuarios: string[];
  }
) {
  return await projectService.removeMembroEquipe(params);
}

export async function addMembroEquipe(
  projectService: IProjectServices,
  params: {
    projeto: number;
    usuario: string;
  }
) {
  return await projectService.addMembroEquipe(params);
}
