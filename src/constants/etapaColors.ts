import { ProjetoEtapa } from "@/@types/tProject";

// Shared color palette for project etapas (stages)
export const ETAPA_COLORS: Record<ProjetoEtapa, string> = {
  [ProjetoEtapa.AguardandoArquivos]: "#8b5cf6", // violet-500
  [ProjetoEtapa.Decupagem]: "#ec4899", // pink-500
  [ProjetoEtapa.Revisao]: "#f59e0b", // amber-500
  [ProjetoEtapa.Sonorizacao]: "#06b6d4", // cyan-500
  [ProjetoEtapa.PosProducao]: "#10b981", // emerald-500
  [ProjetoEtapa.Analise]: "#6366f1", // indigo-500
  [ProjetoEtapa.Concluido]: "#22c55e", // green-500
  [ProjetoEtapa.Descontinuado]: "#9ca3af", // gray-400
};

// Standard order for displaying etapas
export const ETAPA_ORDER: ProjetoEtapa[] = [
  ProjetoEtapa.AguardandoArquivos,
  ProjetoEtapa.Decupagem,
  ProjetoEtapa.Revisao,
  ProjetoEtapa.Sonorizacao,
  ProjetoEtapa.PosProducao,
  ProjetoEtapa.Analise,
  ProjetoEtapa.Concluido,
  ProjetoEtapa.Descontinuado,
];

