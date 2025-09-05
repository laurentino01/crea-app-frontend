import type { tPontuacaoProjeto } from "@/@types/tAvaliacao";
import type { tIdProjeto, tIdUsuario } from "@/@types/tProject";

export interface IPontuacaoServices {
  // Insere/atualiza a pontuação agregada por usuário em um projeto
  upsert(p: tPontuacaoProjeto): Promise<void>;

  // Recupera a pontuação de um usuário em um projeto
  findByProjetoUsuario(
    idProjeto: tIdProjeto,
    idUsuario: tIdUsuario
  ): Promise<tPontuacaoProjeto | null>;

  // Lista pontuações por projeto (todos usuários)
  listByProjeto(idProjeto: tIdProjeto): Promise<tPontuacaoProjeto[]>;

  // Lista todas as pontuações
  listAll(): Promise<tPontuacaoProjeto[]>;
}

