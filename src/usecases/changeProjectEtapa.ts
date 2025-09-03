import { ProjetoEtapa, tProjectPersisted } from "../@types/tProject";
import { IProjectServices } from "../interfaces/IProjectServices";

export async function changeProjectEtapa(
  projectServices: IProjectServices,
  id: string,
  etapa: ProjetoEtapa,
  motivo?: string
): Promise<tProjectPersisted> {
  return projectServices.changeEtapa(id, etapa, motivo);
}

