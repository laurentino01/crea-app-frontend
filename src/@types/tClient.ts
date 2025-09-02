export type tClientCreateDto = {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  categoria: string;
  descricao: string;
  ativo: boolean; // indica se o cliente está ativo/inativo
};

export type tClientPersisted = { id: string } & tClientCreateDto;

export type tClientListQuery = {
  search?: string;
  categoria?: string;
  ativo?: boolean;
};
