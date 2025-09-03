import {
  ProjetoEtapa,
  tChat,
  tEquipe,
  tIdUsuario,
  tProjectCreateDto,
  tProjectListQuery,
  tProjectPersisted,
  tProjetoHistoricoItem,
} from "../@types/tProject";

export interface IProjectServices {
  // CRUD básico
  create(project: tProjectCreateDto): Promise<void>;
  findAll(query?: tProjectListQuery): Promise<tProjectPersisted[]>;
  findById(id: string): Promise<tProjectPersisted | null>;
  update(
    id: string,
    changes: Partial<Omit<tProjectPersisted, "id">>
  ): Promise<tProjectPersisted>;

  // Etapa (status)
  changeEtapa(
    id: string,
    etapa: ProjetoEtapa,
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
  removeEquipeMember(projectId: string, userId: tIdUsuario): Promise<tProjectPersisted>;
}

