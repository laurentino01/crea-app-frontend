import type { tAvaliacaoProjeto } from "@/@types/tAvaliacao";
import type { tIdProjeto, tIdUsuario } from "@/@types/tProject";

export interface IAvaliacaoServices {
  // Adiciona um registro de avaliação (criterio x usuario x projeto)
  add(avaliacao: tAvaliacaoProjeto): Promise<void>;

  // Substitui todas as avaliações de um usuário em um projeto (mantendo 1 conjunto vigente)
  replaceForProjetoUsuario(
    idProjeto: tIdProjeto,
    idUsuario: tIdUsuario,
    avaliacoes: tAvaliacaoProjeto[]
  ): Promise<void>;

  // Lista avaliações por projeto e usuário
  listByProjetoUsuario(
    idProjeto: tIdProjeto,
    idUsuario: tIdUsuario
  ): Promise<tAvaliacaoProjeto[]>;

  // Lista avaliações por projeto (todos usuários)
  listByProjeto(idProjeto: tIdProjeto): Promise<tAvaliacaoProjeto[]>;

  // Lista todas as avaliações
  listAll(): Promise<tAvaliacaoProjeto[]>;
}
