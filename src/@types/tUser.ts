export type tUserCreateDto = {
  nomeCompleto: string;
  apelido: string;
  email: string;
  senha: string;
  senhaConfirm: string;
  dataNascimento?: Date;
  isAdm: boolean;
};

export type tUserPersisted = Omit<tUserCreateDto, "senhaConfirm">;
