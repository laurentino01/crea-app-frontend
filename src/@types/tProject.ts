import { tCliente } from "./tClient";

export enum ProjetoEtapa {
  AGUARDANDO_ARQUIVOS = "AGUARDANDO_ARQUIVOS",
  DECUPAGEM = "DECUPAGEM",
  REVISAO = "REVISAO",
  SONORIZACAO = "SONORIZACAO",
  POS_PRODUCAO = "POS_PRODUCAO",
  ANALISE = "ANALISE",
  FINALIZADO = "FINALIZADO",
}

export enum PrioridadeProjeto {
  BAIXA = "BAIXA",
  MEDIA = "MEDIA",
  ALTA = "ALTA",
  URGENTE = "URGENTE",
  CRITICO = "CRITICO",
}

export enum ProgressoProjeto {
  NO_PRAZO = "NO_PRAZO",
  ADIANTADO = "ADIANTADO",
  ATRASADO = "ATRASADO",
  MUITO_ATRASADO = "MUITO_ATRASADO",
}

// IDs auxiliares
export type tIdProjeto = string;
export type tIdUsuario = string;
export type tIdChat = string;

// Tipos auxiliares
export type tProjetoEtapa = ProjetoEtapa;
export type tProjetoCriticidade = PrioridadeProjeto;

// Status de execução de uma etapa (não confundir com o tipo/"nome" da etapa)
export enum ProjetoEtapaStatus {
  NaoIniciado = "nao_iniciado",
  EmAndamento = "em_andamento",
  Concluido = "concluido",
  Descontinuado = "descontinuado",
}

export type tProjetoEtapaItem = {
  id: string;
  idProjeto: tIdProjeto;
  etapa: tProjetoEtapa; // qual etapa do workflow este item representa
  status: EtapaStatus;
  dataInicio?: Date;
  dataFim?: Date;
  responsavel?: tIdUsuario;
};

export type tProjetoHistoricoItem = {
  titulo: string;
  descricao: string;
  idProjeto: tIdProjeto;
  data: Date;
};

export type tEquipe = {
  idProjeto: tIdProjeto;
  idUsuario: tIdUsuario;
};

export type tChat = {
  id: tIdChat;
  idProjeto: tIdProjeto;
  isEquipe: boolean;
  primeiroUsuario: tIdUsuario;
  segundoUsuario: tIdUsuario;
};

export enum EtapaStatus {
  NAO_INICIADO = "NAO_INICIADO",
  ANDAMENTO = "ANDAMENTO",
  CONCLUIDO = "CONCLUIDO",
}

export type tProjetoUsuarioDto = {
  usuario: number;
};

export type tProjectCreateDto = {
  nome: string;

  descricao: string;

  linkArquivos: string;

  cliente: number;

  prioridade: PrioridadeProjeto;

  dataInicio: Date;

  dataFim: Date;

  equipe: tProjetoUsuarioDto[];
};

export type tProjectPersisted = { id: tIdProjeto } & tProjectCreateDto;

export type tProjectListQuery = {
  search?: string;
  etapa?: tProjetoEtapa;
  criticidade?: tProjetoCriticidade;
  isAtrasado?: boolean;
  cliente?: string; // id do cliente
  responsavel?: tIdUsuario;
  // Filtros adicionais
  categoriaCliente?: string; // categoria do cliente (igualdade exata, case-insensitive)
  dataFimPrevistoAte?: Date; // filtra projetos com data fim prevista até esta data (inclusive)
};

export type tUsuarioEquipe = {
  id: number;
  nomecompleto: string;
  apelido: string;
};

export type tProject = {
  id: number;

  nome: string;

  descricao: string;

  linkArquivos: string;

  cliente: tCliente;

  prioridade: PrioridadeProjeto;

  progressoStatus: ProgressoProjeto;

  dataInicio: Date;

  dataFinalizado: Date;

  dataFim: Date;

  criadoEm: Date;

  criadoPor: number;

  atualizadoEm: Date;

  atualizadoPor: number;
};
