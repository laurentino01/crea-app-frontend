import type { tAvaliacaoProjeto } from "@/@types/tAvaliacao";
import type { tIdProjeto, tIdUsuario } from "@/@types/tProject";
import type { IAvaliacaoServices } from "@/interfaces/IAvaliacaoServices";
import {
  AVALIACOES_LS_KEY,
  EVENT_AVALIACAO_UPDATED,
  isBrowser,
  broadcast,
} from "@/lib/avaliacoes.localstorage";

function getStored(): tAvaliacaoProjeto[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(AVALIACOES_LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as tAvaliacaoProjeto[]) : [];
  } catch {
    return [];
  }
}

function setStored(data: tAvaliacaoProjeto[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(AVALIACOES_LS_KEY, JSON.stringify(data));
}

export class LocalStorageAvaliacaoService implements IAvaliacaoServices {
  async add(avaliacao: tAvaliacaoProjeto): Promise<void> {
    const all = getStored();
    all.push(avaliacao);
    setStored(all);
    broadcast(EVENT_AVALIACAO_UPDATED, {
      idProjeto: avaliacao.idProjeto,
      idUsuario: avaliacao.idUsuario,
    });
  }

  async replaceForProjetoUsuario(
    idProjeto: tIdProjeto,
    idUsuario: tIdUsuario,
    avaliacoes: tAvaliacaoProjeto[]
  ): Promise<void> {
    const all = getStored();
    const filtered = all.filter(
      (a) => !(a.idProjeto === idProjeto && a.idUsuario === idUsuario)
    );
    const next = [...filtered, ...avaliacoes];
    setStored(next);
    broadcast(EVENT_AVALIACAO_UPDATED, { idProjeto, idUsuario });
  }

  async listByProjetoUsuario(
    idProjeto: tIdProjeto,
    idUsuario: tIdUsuario
  ): Promise<tAvaliacaoProjeto[]> {
    const all = getStored();
    return all.filter(
      (a) => a.idProjeto === idProjeto && a.idUsuario === idUsuario
    );
  }

  async listByProjeto(idProjeto: tIdProjeto): Promise<tAvaliacaoProjeto[]> {
    const all = getStored();
    return all.filter((a) => a.idProjeto === idProjeto);
  }

  async listAll(): Promise<tAvaliacaoProjeto[]> {
    return getStored();
  }
}

export const avaliacaoService = new LocalStorageAvaliacaoService();
