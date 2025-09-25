// Helpers e mocks de Projetos no localStorage
// Usa IDs dos mocks de usuários e clientes para relacionamentos

import {
  PrioridadeProjeto,
  ProjetoEtapa,
  ProjetoEtapaStatus,
  tProjectPersisted,
  tProjetoHistoricoItem,
  tProjetoEtapaItem,
} from "@/@types/tProject";

export const PROJECTS_LS_KEY = "projects";

// Reaproveitar IDs dos mocks de users/clients definidos nos arquivos correspondentes
// Usuários
const U = {
  JOAO: "USR-JOAOP-001",
  MARIA: "USR-MARIAF-002",
  LUCAS: "USR-LUCASS-003",
  ANA: "USR-ANAQA-004",
  PAULO: "USR-PAULOR-005",
  CAROL: "USR-CAROLS-006",
  RENATO: "USR-RENATOG-007",
  BIANCA: "USR-BIANCAM-008",
  DIEGO: "USR-DIEGOC-009",
  LARISSA: "USR-LARISSAT-010",
} as const;

// Clientes
const C = {
  NOVATECH: "CLI-NOVATECH-001",
  GOLDENFIT: "CLI-GOLDENFIT-002",
  CAMPOVERDE: "CLI-CAMPOVERDE-003",
  URBANX: "CLI-URBANX-004",
  MIDIAFORTE: "CLI-MIDIAFORTE-005",
  PETLOVER: "CLI-PETLOVER-006",
  EDUCAR: "CLI-EDUCAR-007",
  GOURMETCHEF: "CLI-GOURMETCHEF-008",
} as const;

function h(
  idProjeto: string,
  titulo: string,
  descricao: string,
  data: Date
): tProjetoHistoricoItem {
  return { idProjeto, titulo, descricao, data };
}

function etapas(
  idProjeto: string,
  andamento?: { etapa: ProjetoEtapa; status: ProjetoEtapaStatus }
): tProjetoEtapaItem[] {
  const base: ProjetoEtapa[] = [
    ProjetoEtapa.AguardandoArquivos,
    ProjetoEtapa.Decupagem,
    ProjetoEtapa.Revisao,
    ProjetoEtapa.Sonorizacao,
    ProjetoEtapa.PosProducao,
    ProjetoEtapa.Analise,
  ];
  return base.map((et, idx) => ({
    id: `${idProjeto}-ETP-${idx + 1}`,
    idProjeto,
    etapa: et,
    status:
      andamento && andamento.etapa === et
        ? andamento.status
        : ProjetoEtapaStatus.NaoIniciado,
  }));
}

export const PROJECTS_DEFAULT: tProjectPersisted[] = [
  {
    id: "PRJ-NOV-TUTORIAL-001",
    nome: "Video Tutorial Onboarding",
    descricao: "Série de vídeos curtos de onboarding para app",
    urlArquivos: "https://files.example.test/novatech/onboarding",
    etapa: ProjetoEtapa.Decupagem,
    criticidade: PrioridadeProjeto.Media,
    isAtrasado: false,
    cliente: C.NOVATECH,
    dataInicio: new Date("2025-08-20"),
    dataFimPrevisto: new Date("2025-09-10"),
    responsavel: U.JOAO,
    historico: [
      h(
        "PRJ-NOV-TUTORIAL-001",
        "Briefing aprovado",
        "Escopo fechado com o cliente",
        new Date("2025-08-21")
      ),
    ],
    equipe: [
      { idProjeto: "PRJ-NOV-TUTORIAL-001", idUsuario: U.MARIA },
      { idProjeto: "PRJ-NOV-TUTORIAL-001", idUsuario: U.LUCAS },
    ],
    etapas: etapas("PRJ-NOV-TUTORIAL-001", {
      etapa: ProjetoEtapa.Decupagem,
      status: ProjetoEtapaStatus.EmAndamento,
    }),
  },
  {
    id: "PRJ-GFT-CAMPANHA-002",
    nome: "Campanha Verão 2025",
    descricao: "Série de vídeos para campanha de verão",
    urlArquivos: "https://files.example.test/goldenfit/verao-2025",
    etapa: ProjetoEtapa.Revisao,
    criticidade: PrioridadeProjeto.Alta,
    isAtrasado: true,
    cliente: C.GOLDENFIT,
    dataInicio: new Date("2025-07-01"),
    dataFimPrevisto: new Date("2025-08-15"),
    responsavel: U.CAROL,
    historico: [
      h(
        "PRJ-GFT-CAMPANHA-002",
        "Primeiro corte enviado",
        "Cliente solicitou ajustes de cor",
        new Date("2025-08-10")
      ),
    ],
    equipe: [
      { idProjeto: "PRJ-GFT-CAMPANHA-002", idUsuario: U.RENATO },
      { idProjeto: "PRJ-GFT-CAMPANHA-002", idUsuario: U.DIEGO },
    ],
    etapas: etapas("PRJ-GFT-CAMPANHA-002", {
      etapa: ProjetoEtapa.Revisao,
      status: ProjetoEtapaStatus.EmAndamento,
    }),
  },
  {
    id: "PRJ-CVD-DOC-003",
    nome: "Documentário Agro Sustentável",
    descricao: "Edição e pós de documentário institucional",
    urlArquivos: "https://files.example.test/campo-verde/doc",
    etapa: ProjetoEtapa.Sonorizacao,
    criticidade: PrioridadeProjeto.Baixa,
    isAtrasado: false,
    cliente: C.CAMPOVERDE,
    dataInicio: new Date("2025-05-10"),
    dataFimPrevisto: new Date("2025-10-01"),
    responsavel: U.PAULO,
    historico: [
      h(
        "PRJ-CVD-DOC-003",
        "Captação recebida",
        "Arquivos organizados no servidor",
        new Date("2025-05-12")
      ),
    ],
    equipe: [
      { idProjeto: "PRJ-CVD-DOC-003", idUsuario: U.ANA },
      { idProjeto: "PRJ-CVD-DOC-003", idUsuario: U.LARISSA },
    ],
  },
  {
    id: "PRJ-URB-CASO-004",
    nome: "Estudos de Caso UrbanX",
    descricao: "Série curta de estudos de caso filmados",
    urlArquivos: "https://files.example.test/urbanx/cases",
    etapa: ProjetoEtapa.PosProducao,
    criticidade: PrioridadeProjeto.Media,
    isAtrasado: false,
    cliente: C.URBANX,
    dataInicio: new Date("2025-06-05"),
    dataFimPrevisto: new Date("2025-09-25"),
    responsavel: U.MARIA,
    equipe: [
      { idProjeto: "PRJ-URB-CASO-004", idUsuario: U.JOAO },
      { idProjeto: "PRJ-URB-CASO-004", idUsuario: U.BIANCA },
    ],
  },
  {
    id: "PRJ-MID-TRAILER-005",
    nome: "Trailer Institucional 2025",
    descricao: "Trailer 60s para campanha institucional",
    urlArquivos: "https://files.example.test/midiaforte/trailer-2025",
    etapa: ProjetoEtapa.Analise,
    criticidade: PrioridadeProjeto.Urgente,
    isAtrasado: true,
    cliente: C.MIDIAFORTE,
    dataInicio: new Date("2025-08-01"),
    dataFimPrevisto: new Date("2025-08-20"),
    responsavel: U.RENATO,
    historico: [
      h(
        "PRJ-MID-TRAILER-005",
        "Envio para aprovação",
        "Aguardando retorno do board",
        new Date("2025-08-19")
      ),
    ],
  },
  {
    id: "PRJ-PET-TUTORIAIS-006",
    nome: "Tutoriais Produtos Pet",
    descricao: "Conteúdo para e-commerce de produtos pet",
    urlArquivos: "https://files.example.test/petlover/howto",
    etapa: ProjetoEtapa.AguardandoArquivos,
    criticidade: PrioridadeProjeto.Baixa,
    isAtrasado: false,
    cliente: C.PETLOVER,
    dataInicio: new Date("2025-09-01"),
    dataFimPrevisto: new Date("2025-10-10"),
    responsavel: U.BIANCA,
  },
  {
    id: "PRJ-EDU-WEBINAR-007",
    nome: "Série de Webinars",
    descricao: "Gravação e edição de 4 webinars",
    urlArquivos: "https://files.example.test/educar/webinars",
    etapa: ProjetoEtapa.Revisao,
    criticidade: PrioridadeProjeto.Media,
    isAtrasado: false,
    cliente: C.EDUCAR,
    dataInicio: new Date("2025-07-15"),
    dataFimPrevisto: new Date("2025-09-05"),
    responsavel: U.DIEGO,
    equipe: [{ idProjeto: "PRJ-EDU-WEBINAR-007", idUsuario: U.CAROL }],
  },
  {
    id: "PRJ-GCH-RECEITAS-008",
    nome: "Receitas Gourmet - Temporada 2",
    descricao: "Série de vídeos de receitas",
    urlArquivos: "https://files.example.test/gourmetchef/receitas-t2",
    etapa: ProjetoEtapa.Concluido,
    criticidade: PrioridadeProjeto.Baixa,
    isAtrasado: false,
    cliente: C.GOURMETCHEF,
    dataInicio: new Date("2025-04-01"),
    dataFimPrevisto: new Date("2025-06-15"),
    dataFimReal: new Date("2025-06-10"),
    responsavel: U.LUCAS,
  },
  {
    id: "PRJ-NOV-TEASER-009",
    nome: "Teaser App NovaTech",
    descricao: "Teaser de 30s para lançamento de feature",
    urlArquivos: "https://files.example.test/novatech/teaser",
    etapa: ProjetoEtapa.PosProducao,
    criticidade: PrioridadeProjeto.Urgente,
    isAtrasado: true,
    cliente: C.NOVATECH,
    dataInicio: new Date("2025-08-25"),
    dataFimPrevisto: new Date("2025-09-05"),
    responsavel: U.JOAO,
  },
  {
    id: "PRJ-GFT-SOCIAL-010",
    nome: "Social Shorts Academia",
    descricao: "Conteúdos curtos para redes sociais",
    urlArquivos: "https://files.example.test/goldenfit/shorts",
    etapa: ProjetoEtapa.Decupagem,
    criticidade: PrioridadeProjeto.Media,
    isAtrasado: false,
    cliente: C.GOLDENFIT,
    dataInicio: new Date("2025-08-15"),
    dataFimPrevisto: new Date("2025-09-30"),
    responsavel: U.LARISSA,
  },
  {
    id: "PRJ-URB-REBRAND-011",
    nome: "Rebranding UrbanX",
    descricao: "Série de vídeos de bastidores do rebrand",
    urlArquivos: "https://files.example.test/urbanx/rebrand",
    etapa: ProjetoEtapa.Analise,
    criticidade: PrioridadeProjeto.Alta,
    isAtrasado: false,
    cliente: C.URBANX,
    dataInicio: new Date("2025-06-10"),
    dataFimPrevisto: new Date("2025-09-20"),
    responsavel: U.MARIA,
  },
  {
    id: "PRJ-MID-CASE-012",
    nome: "Case Mídia Forte 10 anos",
    descricao: "Vídeo comemorativo de 10 anos",
    urlArquivos: "https://files.example.test/midiaforte/case-10",
    etapa: ProjetoEtapa.Sonorizacao,
    criticidade: PrioridadeProjeto.Media,
    isAtrasado: false,
    cliente: C.MIDIAFORTE,
    dataInicio: new Date("2025-07-05"),
    dataFimPrevisto: new Date("2025-09-10"),
    responsavel: U.PAULO,
  },
];

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function seedProjectsToLocalStorage(options?: { force?: boolean }) {
  if (!isBrowser()) return;
  const force = options?.force ?? false;
  const has = localStorage.getItem(PROJECTS_LS_KEY);
  if (has && !force) return;
  localStorage.setItem(PROJECTS_LS_KEY, JSON.stringify(PROJECTS_DEFAULT));
}

export function clearProjectsLocalStorage() {
  if (!isBrowser()) return;
  localStorage.setItem(PROJECTS_LS_KEY, JSON.stringify([]));
}

export function getProjectsFromLocalStorage(): tProjectPersisted[] | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(PROJECTS_LS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as tProjectPersisted[];
    // Revive Datas e Etapas
    return parsed.map((p) => ({
      ...p,
      // Campos obrigatórios devem sempre ser Date
      dataInicio: p.dataInicio ? new Date(p.dataInicio as any) : new Date(),
      dataFimPrevisto: p.dataFimPrevisto
        ? new Date(p.dataFimPrevisto as any)
        : new Date(),
      // Campo opcional permanece opcional
      dataFimReal: p.dataFimReal ? new Date(p.dataFimReal as any) : undefined,
      historico: (p.historico ?? []).map((h) => ({
        ...h,
        data: h.data ? new Date(h.data as any) : new Date(),
      })),
      etapas: (p.etapas ?? []).map((e) => ({
        ...e,
        dataInicio: e.dataInicio ? new Date(e.dataInicio as any) : undefined,
        dataFim: e.dataFim ? new Date(e.dataFim as any) : undefined,
      })),
    }));
  } catch {
    return null;
  }
}
