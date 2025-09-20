export type tClientCreateDto = {
  nome: string;
  email: string;
  categoria: number;
  telefone: string;
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
