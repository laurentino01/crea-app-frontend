export type tUserCreateDto = {
  nomeCompleto: string;
  apelido: string;
  email: string;
  senha: string;
  senhaConfirm: string;
  dataNascimento?: Date;
  isAdm: boolean;
  ativo: boolean; // indica se o usuário está ativo/inativo
};

export type tUserPersisted = { id: string } & Omit<
  tUserCreateDto,
  "senhaConfirm"
>;

export type tUserListQuery = {
  search?: string;
  isAdm?: boolean;
};

export type tUserAuth = {
  email: string;
  password: string;
};
