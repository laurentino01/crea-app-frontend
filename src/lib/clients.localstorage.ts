// Helpers e mocks de Clientes no localStorage
// Permite semear (seed) e limpar quando quiser

import { tClientPersisted } from "@/@types/tClient";

export const CLIENTS_LS_KEY = "clients";

export const CLIENTS_DEFAULT: tClientPersisted[] = [
  {
    id: "CLI-NOVATECH-001",
    nome: "NovaTech Ltda",
    email: "contato@novatech.test",
    telefone: "+55 11 99876-1101",
    endereco: "Av. Paulista, 1000 - São Paulo/SP",
    categoria: "tecnologia",
    descricao: "Startup de SaaS com foco em automação",
    ativo: true,
  },
  {
    id: "CLI-GOLDENFIT-002",
    nome: "Golden Fit",
    email: "comercial@goldenfit.test",
    telefone: "+55 21 99777-2202",
    endereco: "Rua das Laranjeiras, 45 - Rio de Janeiro/RJ",
    categoria: "saude",
    descricao: "Rede de academias premium",
    ativo: true,
  },
  {
    id: "CLI-CAMPOVERDE-003",
    nome: "Campo Verde Alimentos",
    email: "atendimento@campo-verde.test",
    telefone: "+55 31 98888-3303",
    endereco: "Av. do Contorno, 3500 - Belo Horizonte/MG",
    categoria: "alimentos",
    descricao: "Indústria de alimentos orgânicos",
    ativo: true,
  },
  {
    id: "CLI-URBANX-004",
    nome: "UrbanX",
    email: "oi@urbanx.test",
    telefone: "+55 41 97654-4404",
    endereco: "Rua XV de Novembro, 123 - Curitiba/PR",
    categoria: "design",
    descricao: "Estúdio de design e arquitetura",
    ativo: true,
  },
  {
    id: "CLI-MIDIAFORTE-005",
    nome: "Mídia Forte",
    email: "contato@midiaforte.test",
    telefone: "+55 51 98444-5505",
    endereco: "Av. Ipiranga, 200 - Porto Alegre/RS",
    categoria: "midia",
    descricao: "Agência de publicidade e mídia",
    ativo: true,
  },
  {
    id: "CLI-PETLOVER-006",
    nome: "Pet Lover",
    email: "sac@petlover.test",
    telefone: "+55 19 98999-6606",
    endereco: "Av. Barão de Itapura, 900 - Campinas/SP",
    categoria: "varejo",
    descricao: "E-commerce de produtos pet",
    ativo: false,
  },
  {
    id: "CLI-EDUCAR-007",
    nome: "Educar+",
    email: "parcerias@educarmais.test",
    telefone: "+55 85 98765-7707",
    endereco: "Av. Beira Mar, 700 - Fortaleza/CE",
    categoria: "educacao",
    descricao: "Plataforma de educação a distância",
    ativo: true,
  },
  {
    id: "CLI-GOURMETCHEF-008",
    nome: "Gourmet Chef",
    email: "chef@gourmetchef.test",
    telefone: "+55 62 97654-8808",
    endereco: "Rua T-63, 321 - Goiânia/GO",
    categoria: "gastronomia",
    descricao: "Rede de restaurantes contemporâneos",
    ativo: true,
  },
];

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function seedClientsToLocalStorage(options?: { force?: boolean }) {
  if (!isBrowser()) return;
  const force = options?.force ?? false;
  const has = localStorage.getItem(CLIENTS_LS_KEY);
  if (has && !force) return;
  localStorage.setItem(CLIENTS_LS_KEY, JSON.stringify(CLIENTS_DEFAULT));
}

export function clearClientsLocalStorage() {
  if (!isBrowser()) return;
  localStorage.setItem(CLIENTS_LS_KEY, JSON.stringify([]));
}

export function getClientsFromLocalStorage(): tClientPersisted[] | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(CLIENTS_LS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as tClientPersisted[];
  } catch {
    return null;
  }
}

