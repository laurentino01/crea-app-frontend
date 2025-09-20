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
