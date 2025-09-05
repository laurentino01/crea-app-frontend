import type { tPontuacaoProjeto } from "@/@types/tAvaliacao";
import type { tIdProjeto, tIdUsuario } from "@/@types/tProject";
import type { IPontuacaoServices } from "@/interfaces/IPontuacaoServices";
import {
  PONTUACOES_LS_KEY,
  EVENT_PONTUACAO_UPDATED,
  isBrowser,
  broadcast,
} from "@/lib/avaliacoes.localstorage";

function getStored(): tPontuacaoProjeto[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(PONTUACOES_LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as tPontuacaoProjeto[]) : [];
  } catch {
    return [];
  }
}

function setStored(data: tPontuacaoProjeto[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(PONTUACOES_LS_KEY, JSON.stringify(data));
}

export class LocalStoragePontuacaoService implements IPontuacaoServices {
  async upsert(p: tPontuacaoProjeto): Promise<void> {
    const all = getStored();
    const idx = all.findIndex(
      (x) => x.idProjeto === p.idProjeto && x.idUsuario === p.idUsuario
    );
    if (idx === -1) {
      all.push(p);
    } else {
      all[idx] = p;
    }
    setStored(all);
    broadcast(EVENT_PONTUACAO_UPDATED, {
      idProjeto: p.idProjeto,
      idUsuario: p.idUsuario,
    });
  }

  async findByProjetoUsuario(
    idProjeto: tIdProjeto,
    idUsuario: tIdUsuario
  ): Promise<tPontuacaoProjeto | null> {
    const all = getStored();
    return (
      all.find((x) => x.idProjeto === idProjeto && x.idUsuario === idUsuario) ??
      null
    );
  }

  async listByProjeto(idProjeto: tIdProjeto): Promise<tPontuacaoProjeto[]> {
    const all = getStored();
    return all.filter((x) => x.idProjeto === idProjeto);
  }

  async listAll(): Promise<tPontuacaoProjeto[]> {
    return getStored();
  }
}

export const pontuacaoService = new LocalStoragePontuacaoService();

