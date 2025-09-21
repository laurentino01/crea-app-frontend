export type tClientCreateDto = {
  nome: string;
  categoria: number;
  descricao: string;
};

export type tClientPersisted = { id: string } & tClientCreateDto;

export type tClientListQuery = {
  search?: string;
  categoria?: string;
  ativo?: boolean;
};

export type tClienteCategoriaCreateDto = {
  titulo: string;
};

export type tClienteCategoria = {
  atualizadoEm: Date;
  atualizadoPor: number;
  criadoEm: Date;
  criadoPor: number;
  id: number;
  titulo: string;
};

export type tCliente = {
  atualizadoEm: Date;
  atualizadoPor: number;
  categoria: number;
  criadoEm: Date;
  criadoPor: number;
  descricao: string;
  id: number;
  nome: string;
};
