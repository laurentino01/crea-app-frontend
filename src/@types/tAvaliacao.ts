import { tIdProjeto, tIdUsuario } from "./tProject";

export enum TipoCriterio {
  Advertencia = "advertencia",
  Positivo = "positivo",
}

/*Multiplica os pontos de cada projeto dependendo da dificuldade*/
export enum Dificuldade {
  facil = 1,
  medio = 2,
  dificil = 3,
  hardcore = 5,
}

export type tCriterioAvaliacao = {
  id: string;
  criterio: string;
  ponto: number;
  tipoCriterio: TipoCriterio;
};

export type tAvaliacaoProjeto = {
  idCriterio: tCriterioAvaliacao;
  idProjeto: tIdProjeto;
  idUsuario: tIdUsuario;
};

export type tPontuacaoProjeto = {
  idUsuario: tIdUsuario;
  idProjeto: tIdProjeto;
  positivos: tCriterioAvaliacao;
  advertencia: tCriterioAvaliacao;
  dificuldade: Dificuldade;
  pontuacao: number; // (positivos - advertencia) * dificuldade
};
