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

export enum ProjetoCriticidade {
  Baixa = "baixa",
  Media = "media",
  Alta = "alta",
  Urgente = "urgente",
}

// IDs auxiliares
export type tIdProjeto = string;
export type tIdUsuario = string;
export type tIdChat = string;

// Tipos auxiliares
export type tProjetoEtapa = ProjetoEtapa;
export type tProjetoCriticidade = ProjetoCriticidade;

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
  status: ProjetoEtapaStatus;
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

// Projeto (similar ao padrão de Client/User)
export type tProjectCreateDto = {
  nome: string;
  descricao: string;
  urlArquivos: string;
  etapa: tProjetoEtapa;
  criticidade: tProjetoCriticidade;
  isAtrasado: boolean;
  cliente: string; // id do cliente
  dataInicio: Date;
  dataFimPrevisto: Date;
  dataFimReal?: Date;
  historico?: tProjetoHistoricoItem[];
  responsavel: tIdUsuario;
  chat?: tChat[];
  equipe?: tEquipe[];
  etapas?: tProjetoEtapaItem[]; // status por etapa do workflow
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
