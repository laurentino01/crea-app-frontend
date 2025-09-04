import {
  ProjetoEtapa,
  ProjetoEtapaStatus,
  tChat,
  tEquipe,
  tIdUsuario,
  tProjectCreateDto,
  tProjectListQuery,
  tProjectPersisted,
  tProjetoHistoricoItem,
  tProjetoEtapaItem,
} from "../@types/tProject";
import { IProjectServices } from "../interfaces/IProjectServices";

const STORAGE_KEY = "projects";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function generateId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  ).toUpperCase();
}

function reviveDate(val: any): Date | undefined {
  if (!val) return undefined;
  const d = new Date(val as string);
  return isNaN(d.getTime()) ? undefined : d;
}

function getStoredProjects(): tProjectPersisted[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as any[];
    if (!Array.isArray(parsed)) return [];

    const normalized = parsed.map((p) => {
      const proj = p as any;
      const historico = Array.isArray(proj.historico) ? proj.historico : [];
      const chat = Array.isArray(proj.chat) ? proj.chat : [];
      const equipe = Array.isArray(proj.equipe) ? proj.equipe : [];
      const etapas = Array.isArray(proj.etapas) ? proj.etapas : [];
      return {
        ...proj,
        dataInicio: reviveDate(proj.dataInicio)!,
        dataFimPrevisto: reviveDate(proj.dataFimPrevisto)!,
        dataFimReal: reviveDate(proj.dataFimReal),
        historico: historico.map((h: any) => ({
          ...h,
          data: reviveDate(h?.data)!,
        })),
        chat,
        equipe,
        etapas: etapas.map((e: any) => ({
          ...e,
          dataInicio: reviveDate(e?.dataInicio),
          dataFim: reviveDate(e?.dataFim),
        })),
      } as tProjectPersisted;
    });
    return normalized;
  } catch {
    return [];
  }
}

function setStoredProjects(projects: tProjectPersisted[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

// Ordem base das etapas do workflow (sem Concluido/Descontinuado)
const BASE_WORKFLOW_ORDER: ProjetoEtapa[] = [
  ProjetoEtapa.AguardandoArquivos,
  ProjetoEtapa.Decupagem,
  ProjetoEtapa.Revisao,
  ProjetoEtapa.Sonorizacao,
  ProjetoEtapa.PosProducao,
  ProjetoEtapa.Analise,
];

function broadcastProjectUpdated(id: string) {
  if (!isBrowser()) return;
  try {
    const evt = new CustomEvent("project-updated", { detail: { id } });
    window.dispatchEvent(evt);
  } catch {}
}

export class LocalStorageProjectService implements IProjectServices {
  async create(project: tProjectCreateDto): Promise<void> {
    const all = getStoredProjects();
    const newProject: tProjectPersisted = {
      id: generateId(),
      historico: project.historico ?? [],
      chat: project.chat ?? [],
      equipe: project.equipe ?? [],
      ...project,
    } as tProjectPersisted;
    // Inicializa etapas se não vierem do DTO
    if (!Array.isArray(newProject.etapas) || newProject.etapas.length === 0) {
      newProject.etapas = BASE_WORKFLOW_ORDER.map((et) => ({
        id: generateId(),
        idProjeto: newProject.id,
        etapa: et,
        status: ProjetoEtapaStatus.NaoIniciado,
      }));
    }
    all.push(newProject);
    setStoredProjects(all);
    broadcastProjectUpdated(newProject.id);
  }

  async findAll(query?: tProjectListQuery): Promise<tProjectPersisted[]> {
    const all = getStoredProjects();
    if (!query) return all;

    const { search, etapa, isAtrasado, cliente, responsavel } = query;
    let filtered = all;

    if (typeof isAtrasado === "boolean") {
      filtered = filtered.filter((p) => p.isAtrasado === isAtrasado);
    }

    if (etapa) {
      filtered = filtered.filter((p) => p.etapa === etapa);
    }

    if (cliente) {
      filtered = filtered.filter((p) => p.cliente === cliente);
    }

    if (responsavel) {
      filtered = filtered.filter((p) => p.responsavel === responsavel);
    }

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter((p) => {
        const nome = p.nome?.toLowerCase?.() ?? "";
        const desc = p.descricao?.toLowerCase?.() ?? "";
        const clienteStr = p.cliente?.toLowerCase?.() ?? "";
        return (
          nome.includes(term) ||
          desc.includes(term) ||
          clienteStr.includes(term)
        );
      });
    }

    return filtered;
  }

  async findById(id: string): Promise<tProjectPersisted | null> {
    const all = getStoredProjects();
    const found = all.find((p) => p.id === id);
    return found ?? null;
  }

  async update(
    id: string,
    changes: Partial<Omit<tProjectPersisted, "id">>
  ): Promise<tProjectPersisted> {
    const all = getStoredProjects();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Project not found");

    const updated: tProjectPersisted = {
      ...all[idx],
      ...changes,
      id,
    } as tProjectPersisted;

    all[idx] = updated;
    setStoredProjects(all);
    broadcastProjectUpdated(id);
    return updated;
  }

  async changeEtapa(
    id: string,
    etapa: ProjetoEtapa,
    motivo?: string
  ): Promise<tProjectPersisted> {
    const all = getStoredProjects();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Project not found");
    const prev = all[idx].etapa;
    const updated = { ...all[idx], etapa } as tProjectPersisted;
    const historicoItem: tProjetoHistoricoItem = {
      titulo: "Mudança de etapa",
      descricao:
        (motivo?.trim() ? `${motivo.trim()} | ` : "") +
        `De ${prev} para ${etapa}`,
      idProjeto: id,
      data: new Date(),
    };
    updated.historico = [...(updated.historico ?? []), historicoItem];
    all[idx] = updated;
    setStoredProjects(all);
    broadcastProjectUpdated(id);
    return updated;
  }

  async addHistorico(
    projectId: string,
    entry: Omit<tProjetoHistoricoItem, "idProjeto" | "data"> & { data?: Date }
  ): Promise<tProjetoHistoricoItem> {
    const all = getStoredProjects();
    const idx = all.findIndex((p) => p.id === projectId);
    if (idx === -1) throw new Error("Project not found");
    const item: tProjetoHistoricoItem = {
      ...entry,
      idProjeto: projectId,
      data: entry.data ?? new Date(),
    } as tProjetoHistoricoItem;
    const updated = {
      ...all[idx],
      historico: [...(all[idx].historico ?? []), item],
    } as tProjectPersisted;
    all[idx] = updated;
    setStoredProjects(all);
    broadcastProjectUpdated(projectId);
    return item;
  }

  async getHistorico(projectId: string): Promise<tProjetoHistoricoItem[]> {
    const proj = await this.findById(projectId);
    return proj?.historico ?? [];
  }

  async createChat(
    projectId: string,
    chat: Omit<tChat, "id" | "idProjeto">
  ): Promise<tChat> {
    const all = getStoredProjects();
    const idx = all.findIndex((p) => p.id === projectId);
    if (idx === -1) throw new Error("Project not found");
    const newChat: tChat = { id: generateId(), idProjeto: projectId, ...chat };
    const updated = {
      ...all[idx],
      chat: [...(all[idx].chat ?? []), newChat],
    } as tProjectPersisted;
    all[idx] = updated;
    setStoredProjects(all);
    broadcastProjectUpdated(projectId);
    return newChat;
  }

  async getChats(projectId: string): Promise<tChat[]> {
    const proj = await this.findById(projectId);
    return proj?.chat ?? [];
  }

  async changeResponsavel(
    projectId: string,
    novoResponsavelId: tIdUsuario
  ): Promise<tProjectPersisted> {
    const all = getStoredProjects();
    const idx = all.findIndex((p) => p.id === projectId);
    if (idx === -1) throw new Error("Project not found");
    const prev = all[idx].responsavel;
    const updated = {
      ...all[idx],
      responsavel: novoResponsavelId,
    } as tProjectPersisted;
    const historicoItem: tProjetoHistoricoItem = {
      titulo: "Troca de responsável",
      descricao: `De ${prev} para ${novoResponsavelId}`,
      idProjeto: projectId,
      data: new Date(),
    };
    updated.historico = [...(updated.historico ?? []), historicoItem];
    all[idx] = updated;
    setStoredProjects(all);
    broadcastProjectUpdated(projectId);
    return updated;
  }

  async addEquipeMember(
    projectId: string,
    userId: tIdUsuario
  ): Promise<tProjectPersisted> {
    const all = getStoredProjects();
    const idx = all.findIndex((p) => p.id === projectId);
    if (idx === -1) throw new Error("Project not found");
    const exists = (all[idx].equipe ?? []).some((m) => m.idUsuario === userId);
    const equipeEntry: tEquipe = { idProjeto: projectId, idUsuario: userId };
    const nextEquipe = exists
      ? all[idx].equipe
      : [...(all[idx].equipe ?? []), equipeEntry];
    const updated = { ...all[idx], equipe: nextEquipe } as tProjectPersisted;
    if (!exists) {
      const historicoItem: tProjetoHistoricoItem = {
        titulo: "Entrada na equipe",
        descricao: `Usuário ${userId} adicionado à equipe`,
        idProjeto: projectId,
        data: new Date(),
      };
      updated.historico = [...(updated.historico ?? []), historicoItem];
    }
    all[idx] = updated;
    setStoredProjects(all);
    broadcastProjectUpdated(projectId);
    return updated;
  }

  async updateEquipeMember(
    projectId: string,
    oldUserId: tIdUsuario,
    newUserId: tIdUsuario
  ): Promise<tProjectPersisted> {
    const all = getStoredProjects();
    const idx = all.findIndex((p) => p.id === projectId);
    if (idx === -1) throw new Error("Project not found");
    const equipe = [...(all[idx].equipe ?? [])];
    const mIdx = equipe.findIndex((m) => m.idUsuario === oldUserId);
    if (mIdx === -1) throw new Error("Equipe member not found");
    equipe[mIdx] = { idProjeto: projectId, idUsuario: newUserId };
    const updated = { ...all[idx], equipe } as tProjectPersisted;
    const historicoItem: tProjetoHistoricoItem = {
      titulo: "Atualização de equipe",
      descricao: `Usuário ${oldUserId} substituído por ${newUserId}`,
      idProjeto: projectId,
      data: new Date(),
    };
    updated.historico = [...(updated.historico ?? []), historicoItem];
    all[idx] = updated;
    setStoredProjects(all);
    return updated;
  }

  async removeEquipeMember(
    projectId: string,
    userId: tIdUsuario
  ): Promise<tProjectPersisted> {
    const all = getStoredProjects();
    const idx = all.findIndex((p) => p.id === projectId);
    if (idx === -1) throw new Error("Project not found");
    const equipe = (all[idx].equipe ?? []).filter(
      (m) => m.idUsuario !== userId
    );
    const updated = { ...all[idx], equipe } as tProjectPersisted;
    const historicoItem: tProjetoHistoricoItem = {
      titulo: "Saída da equipe",
      descricao: `Usuário ${userId} removido da equipe`,
      idProjeto: projectId,
      data: new Date(),
    } as tProjetoHistoricoItem;
    updated.historico = [...(updated.historico ?? []), historicoItem];
    all[idx] = updated;
    setStoredProjects(all);
    broadcastProjectUpdated(projectId);
    return updated;
  }

  // ====== Workflow por etapa ======
  async getEtapas(projectId: string): Promise<tProjetoEtapaItem[]> {
    const proj = await this.findById(projectId);
    return (proj?.etapas ?? []) as tProjetoEtapaItem[];
  }

  async updateEtapaItem(
    projectId: string,
    etapa: ProjetoEtapa,
    changes: Partial<Omit<tProjetoEtapaItem, "id" | "idProjeto" | "etapa">>
  ): Promise<tProjetoEtapaItem> {
    const all = getStoredProjects();
    const pIdx = all.findIndex((p) => p.id === projectId);
    if (pIdx === -1) throw new Error("Project not found");
    const etapas = [...(all[pIdx].etapas ?? [])] as tProjetoEtapaItem[];
    let eIdx = etapas.findIndex((e) => e.etapa === etapa);
    // Se a etapa não existir ainda (projetos antigos ou dados inconsistentes), cria-a
    if (eIdx === -1) {
      const newItem: tProjetoEtapaItem = {
        id: generateId(),
        idProjeto: projectId,
        etapa,
        status: ProjetoEtapaStatus.NaoIniciado,
      } as tProjetoEtapaItem;
      etapas.push(newItem);
      eIdx = etapas.length - 1;
    }

    const prev = etapas[eIdx];
    let next: tProjetoEtapaItem = { ...prev, ...changes } as tProjetoEtapaItem;

    // Regras automáticas de datas conforme status
    if (changes.status) {
      if (
        changes.status === ProjetoEtapaStatus.EmAndamento &&
        !next.dataInicio
      ) {
        next.dataInicio = new Date();
      }
      if (changes.status === ProjetoEtapaStatus.Concluido && !next.dataFim) {
        next.dataFim = new Date();
      }
      if (changes.status === ProjetoEtapaStatus.Descontinuado) {
        if (!next.dataInicio) next.dataInicio = new Date();
        if (!next.dataFim) next.dataFim = new Date();
      }
    }

    etapas[eIdx] = next;
    const updated = { ...all[pIdx], etapas } as tProjectPersisted;

    // Se definiu responsável na etapa, vira responsável do projeto
    if (changes.responsavel) {
      updated.responsavel = changes.responsavel;
      const historicoItem: tProjetoHistoricoItem = {
        titulo: "Responsável de etapa definido",
        descricao: `Etapa ${etapa}: responsável ${changes.responsavel}`,
        idProjeto: projectId,
        data: new Date(),
      };
      updated.historico = [...(updated.historico ?? []), historicoItem];
    }

    all[pIdx] = updated;
    setStoredProjects(all);
    broadcastProjectUpdated(projectId);
    return next;
  }

  async setProjetoConcluido(projectId: string): Promise<tProjectPersisted> {
    const all = getStoredProjects();
    const idx = all.findIndex((p) => p.id === projectId);
    if (idx === -1) throw new Error("Project not found");
    const etapas = (all[idx].etapas ?? []) as tProjetoEtapaItem[];
    const now = new Date();
    const nextEtapas = etapas.map((e) => {
      if (e.status === ProjetoEtapaStatus.Descontinuado) return e;
      return {
        ...e,
        status: ProjetoEtapaStatus.Concluido,
        dataInicio: e.dataInicio ?? now,
        dataFim: e.dataFim ?? now,
      } as tProjetoEtapaItem;
    });
    const updated: tProjectPersisted = {
      ...all[idx],
      etapas: nextEtapas,
      etapa: ProjetoEtapa.Concluido,
      dataFimReal: all[idx].dataFimReal ?? now,
      historico: [
        ...(all[idx].historico ?? []),
        {
          titulo: "Projeto concluído",
          descricao: "Todas as etapas marcadas como concluídas",
          idProjeto: projectId,
          data: now,
        },
      ],
    } as tProjectPersisted;
    all[idx] = updated;
    setStoredProjects(all);
    broadcastProjectUpdated(projectId);
    return updated;
  }

  async setProjetoDescontinuado(
    projectId: string,
    motivo?: string
  ): Promise<tProjectPersisted> {
    const all = getStoredProjects();
    const idx = all.findIndex((p) => p.id === projectId);
    if (idx === -1) throw new Error("Project not found");
    const etapas = (all[idx].etapas ?? []) as tProjetoEtapaItem[];
    const now = new Date();
    const nextEtapas = etapas.map((e) => ({
      ...e,
      status: ProjetoEtapaStatus.Descontinuado,
      dataInicio: e.dataInicio ?? now,
      dataFim: e.dataFim ?? now,
    }));
    const updated: tProjectPersisted = {
      ...all[idx],
      etapas: nextEtapas,
      etapa: ProjetoEtapa.Descontinuado,
      historico: [
        ...(all[idx].historico ?? []),
        {
          titulo: "Projeto descontinuado",
          descricao: motivo?.trim() || "Marcado como descontinuado",
          idProjeto: projectId,
          data: now,
        },
      ],
    } as tProjectPersisted;
    all[idx] = updated;
    setStoredProjects(all);
    broadcastProjectUpdated(projectId);
    return updated;
  }
}

export const projectService = new LocalStorageProjectService();
