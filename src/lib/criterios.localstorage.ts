// Utilitário para registrar critérios no localStorage sem criar funcionalidades na UI
// Reutiliza os tipos existentes do projeto

import { TipoCriterio, tCriterioAvaliacao } from "@/@types/tAvaliacao";

export const CRITERIOS_LS_KEY = "crea.criterios.v1";

// Pontos sempre inteiros e positivos; o tipo (positivo/advertencia) define o sinal
export const CRITERIOS_DEFAULT: tCriterioAvaliacao[] = [
  // Pontos Positivos
  {
    id: "entrega-antecipada-com-qualidade",
    criterio: "Entrega antecipada (com qualidade)",
    ponto: 2,
    tipoCriterio: TipoCriterio.Positivo,
  },
  {
    id: "entrega-no-prazo-zero-correcoes",
    criterio: "Entrega no prazo com zero correções",
    ponto: 2,
    tipoCriterio: TipoCriterio.Positivo,
  },
  {
    id: "sugestoes-criativas",
    criterio: "Sugestões criativas",
    ponto: 2,
    tipoCriterio: TipoCriterio.Positivo,
  },
  {
    id: "boa-comunicacao-e-disponibilidade",
    criterio: "Boa comunicação e disponibilidade",
    ponto: 1,
    tipoCriterio: TipoCriterio.Positivo,
  },
  {
    id: "organizacao-exemplar-dos-arquivos",
    criterio: "Organização exemplar dos arquivos",
    ponto: 1,
    tipoCriterio: TipoCriterio.Positivo,
  },
  {
    id: "feedback-positivo-do-cliente",
    criterio: "Feedback positivo do cliente",
    ponto: 3,
    tipoCriterio: TipoCriterio.Positivo,
  },
  {
    id: "assumir-ajustes-de-ultima-hora",
    criterio: "Assumir ajustes de última hora",
    ponto: 1,
    tipoCriterio: TipoCriterio.Positivo,
  },

  // Pontos de Advertência (armazenados como inteiros positivos)
  {
    id: "entregar-fora-do-prazo-estipulado",
    criterio: "Entregar fora do prazo estipulado",
    ponto: 2,
    tipoCriterio: TipoCriterio.Advertencia,
  },
  {
    id: "atrasar-em-etapas-intermediarias",
    criterio: "Atrasar em etapas intermediárias",
    ponto: 1,
    tipoCriterio: TipoCriterio.Advertencia,
  },
  {
    id: "falta-de-comunicacao-mais-8h",
    criterio: "Falta de comunicação (>8h)",
    ponto: 1,
    tipoCriterio: TipoCriterio.Advertencia,
  },
  {
    id: "erros-tecnicos-graves",
    criterio: "Erros técnicos graves",
    ponto: 2,
    tipoCriterio: TipoCriterio.Advertencia,
  },
  {
    id: "erros-esteticos-descuidos",
    criterio: "Erros estéticos/descuidos",
    ponto: 1,
    tipoCriterio: TipoCriterio.Advertencia,
  },
  {
    id: "repetir-erros-de-revisoes-anteriores",
    criterio: "Repetir erros pontuados em revisões anteriores",
    ponto: 2,
    tipoCriterio: TipoCriterio.Advertencia,
  },
  {
    id: "perda-de-arquivos",
    criterio: "Perda de arquivos",
    ponto: 2,
    tipoCriterio: TipoCriterio.Advertencia,
  },
];

// Escreve os critérios no localStorage, sem sobrescrever por padrão
export function seedCriteriosToLocalStorage(options?: { force?: boolean }) {
  if (typeof window === "undefined") return; // garante execução apenas no cliente
  const force = options?.force ?? false;
  const has = window.localStorage.getItem(CRITERIOS_LS_KEY);
  if (has && !force) return;
  window.localStorage.setItem(
    CRITERIOS_LS_KEY,
    JSON.stringify(CRITERIOS_DEFAULT)
  );
}

// Helper para leitura, caso precise validar rapidamente no console
export function getCriteriosFromLocalStorage(): tCriterioAvaliacao[] | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CRITERIOS_LS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as tCriterioAvaliacao[];
  } catch {
    return null;
  }
}
