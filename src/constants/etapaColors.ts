import { ProjetoEtapa } from "@/@types/tProject";

// Shared color palette for project etapas (stages)
export const ETAPA_COLORS: Record<ProjetoEtapa, string> = {
  [ProjetoEtapa.AGUARDANDO_ARQUIVOS]: "#8b5cf6", // violet-500
  [ProjetoEtapa.DECUPAGEM]: "#ec4899", // pink-500
  [ProjetoEtapa.REVISAO]: "#f59e0b", // amber-500
  [ProjetoEtapa.SONORIZACAO]: "#06b6d4", // cyan-500
  [ProjetoEtapa.POS_PRODUCAO]: "#10b981", // emerald-500
  [ProjetoEtapa.ANALISE]: "#6366f1", // indigo-500
  [ProjetoEtapa.FINALIZADO]: "#22c55e", // green-500
};

// Standard order for displaying etapas
export const ETAPA_ORDER: ProjetoEtapa[] = [
  ProjetoEtapa.AGUARDANDO_ARQUIVOS,
  ProjetoEtapa.DECUPAGEM,
  ProjetoEtapa.REVISAO,
  ProjetoEtapa.SONORIZACAO,
  ProjetoEtapa.POS_PRODUCAO,
  ProjetoEtapa.ANALISE,
  ProjetoEtapa.FINALIZADO,
];
