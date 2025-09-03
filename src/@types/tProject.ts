export enum ProjetoEtapa {
  AguardandoArquivos = "aguardando_arquivos",
  Decupagem = "decupagem",
  Revisao = "revisao",
  Sonorizacao = "sonorizacao",
  PosProducao = "pos_producao",
  Descontinuado = "descontinuado",
  Analise = "analise",
  Concluido = "concluido",
}

// IDs auxiliares
export type tIdProjeto = string;
export type tIdUsuario = string;
export type tIdChat = string;

// Tipos auxiliares
export type tProjetoEtapa = ProjetoEtapa;

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

// Projeto (similar ao padrão de Client/User)
export type tProjectCreateDto = {
  nome: string;
  descricao: string;
  urlArquivos: string;
  etapa: tProjetoEtapa;
  isAtrasado: boolean;
  cliente: string; // id do cliente
  dataInicio: Date;
  dataFimPrevisto: Date;
  dataFimReal?: Date;
  historico?: tProjetoHistoricoItem[];
  responsavel: tIdUsuario;
  chat?: tChat[];
  equipe?: tEquipe[];
};

export type tProjectPersisted = { id: tIdProjeto } & tProjectCreateDto;

export type tProjectListQuery = {
  search?: string;
  etapa?: tProjetoEtapa;
  isAtrasado?: boolean;
  cliente?: string; // id do cliente
  responsavel?: tIdUsuario;
};

