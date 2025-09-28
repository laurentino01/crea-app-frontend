export enum UserRole {
  ADM = "ADM",
  EDITOR = "EDITOR",
}
export enum FlowTime {
  CHECKOUT = "CHECKOUT",
  CHECKIN = "CHECKIN",
  PAUSE = "PAUSE",
  PLAY = "PLAY",
}

export type tUserCreateDto = {
  email: string;
  password: string;
  passwordConfirm: string;
  nomeCompleto: string;
  apelido: string;
};

export type tUserPersisted = { id: string } & Omit<
  tUserCreateDto,
  "senhaConfirm"
>;

export type tUserListQuery = {
  search?: string;
  isAdm?: boolean;
};

export type tUser = {
  apelido: string;
  atualizadoEm: Date;
  atualizadoPor: number;
  criadoEm: Date;
  criadoPor: number;
  email: string;
  flowTime: FlowTime;
  id: number;
  nomeCompleto: string;
  role: UserRole;
};

export type tUserUpdateDto = {
  id?: number;
  email?: string;
  password?: string;
  passwordConfirm?: string;
  nomeCompleto?: string;
  apelido?: string;
  flowTime?: FlowTime;
  role?: UserRole;
  primeiroAcesso?: boolean;
};

export type tResUpdate = {
  res: any;
  senhaAlterada: boolean;
};

export type tUserAuth = {
  email: string;
  password: string;
};

export type tUserSession = {
  email: string;
  exp: number;
  iat: number;
  id: number;
  nomeCompleto: string;
  primeiroLogin: boolean;
  apelido: string;
  role: UserRole;
};
