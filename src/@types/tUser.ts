export enum UserRole {
  ADM = "ADM",
  EDITOR = "EDITOR",
}

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

export type tUserSession = {
  email: string;
  exp: Date;
  iat: Date;
  id: number;
  nomeCompleto: string;
  primeiroLogin: boolean;
  role: UserRole;
};
