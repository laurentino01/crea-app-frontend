import {
  tProjectCreateDto,
  tProject,
  tUsuarioEquipe,
  EtapaStatus,
  tProjetoEtapaItem,
} from "../@types/tProject";

export interface IProjectServices {
  // CRUD básico
  create(project: tProjectCreateDto): Promise<{ id: number }>;
  /*  findAll(query?: tProjectListQuery): Promise<tProjectPersisted[]>; */
  findById(id: number): Promise<tProject>;
  findEquipe(id: number): Promise<tUsuarioEquipe[]>;
  findByProjetoEStatus(
    id: number,
    status: EtapaStatus
  ): Promise<tProjetoEtapaItem>;
  /*   update(
    id: number,
    changes: Partial<Omit<tProjectPersisted, "id">>
  ): Promise<tProjectPersisted>; */
  /* 
  // Etapa (status)
  changeEtapa(
    id: string,
    etapa: ProjetoEtapa,
    motivo?: string
  ): Promise<tProjectPersisted>;

  // Workflow por etapa
  getEtapas(projectId: string): Promise<tProjetoEtapaItem[]>;
  updateEtapaItem(
    projectId: string,
    etapa: ProjetoEtapa,
    changes: Partial<Omit<tProjetoEtapaItem, "id" | "idProjeto" | "etapa">>
  ): Promise<tProjetoEtapaItem>;
  setProjetoConcluido(projectId: string): Promise<tProjectPersisted>;
  setProjetoDescontinuado(
    projectId: string,
    motivo?: string
  ): Promise<tProjectPersisted>;

  // Histórico
  addHistorico(
    projectId: string,
    entry: Omit<tProjetoHistoricoItem, "idProjeto" | "data"> & { data?: Date }
  ): Promise<tProjetoHistoricoItem>;
  getHistorico(projectId: string): Promise<tProjetoHistoricoItem[]>;

  // Chat
  createChat(
    projectId: string,
    chat: Omit<tChat, "id" | "idProjeto">
  ): Promise<tChat>;
  getChats(projectId: string): Promise<tChat[]>;

  // Responsável
  changeResponsavel(
    projectId: string,
    novoResponsavelId: tIdUsuario
  ): Promise<tProjectPersisted>;

  // Equipe
  addEquipeMember(projectId: string, userId: tIdUsuario): Promise<tProjectPersisted>;
  updateEquipeMember(
    projectId: string,
    oldUserId: tIdUsuario,
    newUserId: tIdUsuario
  ): Promise<tProjectPersisted>;
  removeEquipeMember(projectId: string, userId: tIdUsuario): Promise<tProjectPersisted>; */
}
