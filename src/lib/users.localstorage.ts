// Helpers e mocks de Usuários no localStorage
// Permite semear (seed) e limpar quando quiser

import { tUserPersisted } from "@/@types/tUser";

export const USERS_LS_KEY = "users";

export const USERS_DEFAULT: tUserPersisted[] = [
  {
    id: "USR-JOAOP-001",
    nomeCompleto: "João Pedro Almeida",
    apelido: "joaop",
    email: "joao.almeida@crea.test",
    senha: "123456",
    dataNascimento: new Date("1992-03-14"),
    isAdm: true,
    ativo: true,
  },
  {
    id: "USR-MARIAF-002",
    nomeCompleto: "Maria Fernanda Costa",
    apelido: "mfcosta",
    email: "maria.costa@crea.test",
    senha: "123456",
    dataNascimento: new Date("1989-11-02"),
    isAdm: false,
    ativo: true,
  },
  {
    id: "USR-LUCASS-003",
    nomeCompleto: "Lucas Souza",
    apelido: "lucass",
    email: "lucas.souza@crea.test",
    senha: "123456",
    dataNascimento: new Date("1996-07-22"),
    isAdm: false,
    ativo: true,
  },
  {
    id: "USR-ANAQA-004",
    nomeCompleto: "Ana Clara Queiroz",
    apelido: "anaqa",
    email: "ana.queiroz@crea.test",
    senha: "123456",
    dataNascimento: new Date("1995-01-09"),
    isAdm: false,
    ativo: false,
  },
  {
    id: "USR-PAULOR-005",
    nomeCompleto: "Paulo Roberto",
    apelido: "paulor",
    email: "paulo.roberto@crea.test",
    senha: "123456",
    dataNascimento: new Date("1990-05-30"),
    isAdm: true,
    ativo: true,
  },
  {
    id: "USR-CAROLS-006",
    nomeCompleto: "Carolina Santos",
    apelido: "carols",
    email: "carolina.santos@crea.test",
    senha: "123456",
    dataNascimento: new Date("1998-12-12"),
    isAdm: false,
    ativo: true,
  },
  {
    id: "USR-RENATOG-007",
    nomeCompleto: "Renato Gomes",
    apelido: "renatog",
    email: "renato.gomes@crea.test",
    senha: "123456",
    dataNascimento: new Date("1987-09-18"),
    isAdm: false,
    ativo: true,
  },
  {
    id: "USR-BIANCAM-008",
    nomeCompleto: "Bianca Moraes",
    apelido: "biancam",
    email: "bianca.moraes@crea.test",
    senha: "123456",
    dataNascimento: new Date("1993-04-27"),
    isAdm: false,
    ativo: true,
  },
  {
    id: "USR-DIEGOC-009",
    nomeCompleto: "Diego Carvalho",
    apelido: "diegoc",
    email: "diego.carvalho@crea.test",
    senha: "123456",
    dataNascimento: new Date("1991-10-05"),
    isAdm: false,
    ativo: true,
  },
  {
    id: "USR-LARISSAT-010",
    nomeCompleto: "Larissa Teixeira",
    apelido: "larissat",
    email: "larissa.teixeira@crea.test",
    senha: "123456",
    dataNascimento: new Date("1997-02-16"),
    isAdm: false,
    ativo: true,
  },
];

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function seedUsersToLocalStorage(options?: { force?: boolean }) {
  if (!isBrowser()) return;
  const force = options?.force ?? false;
  const has = localStorage.getItem(USERS_LS_KEY);
  if (has && !force) return;
  localStorage.setItem(USERS_LS_KEY, JSON.stringify(USERS_DEFAULT));
}

export function clearUsersLocalStorage() {
  if (!isBrowser()) return;
  localStorage.setItem(USERS_LS_KEY, JSON.stringify([]));
}

export function getUsersFromLocalStorage(): tUserPersisted[] | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(USERS_LS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as tUserPersisted[];
    return parsed.map((u) => ({
      ...u,
      dataNascimento: u.dataNascimento ? new Date(u.dataNascimento as any) : undefined,
    }));
  } catch {
    return null;
  }
}

