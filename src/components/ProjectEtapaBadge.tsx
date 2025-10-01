"use client";

import React from "react";
import type { tProjetoEtapa } from "@/@types/tProject";
import { ProjetoEtapa } from "@/@types/tProject";
import { ETAPA_COLORS } from "@/constants/etapaColors";

type Props = {
  etapa: tProjetoEtapa;
  className?: string;
};

function etapaLabel(etapa: tProjetoEtapa): string {
  switch (etapa) {
    case ProjetoEtapa.AGUARDANDO_ARQUIVOS:
      return "Aguardando arquivos";
    case ProjetoEtapa.DECUPAGEM:
      return "Decupagem";
    case ProjetoEtapa.REVISAO:
      return "Revisão";
    case ProjetoEtapa.SONORIZACAO:
      return "Sonorização";
    case ProjetoEtapa.POS_PRODUCAO:
      return "Pós-produção";
    case ProjetoEtapa.ANALISE:
      return "Análise";
    case ProjetoEtapa.FINALIZADO:
      return "Concluído";
    default:
      return String(etapa);
  }
}

export default function ProjectEtapaBadge({ etapa, className }: Props) {
  return (
    <span
      className={
        "inline-flex text-sm items-center gap-2 bg-neutral-100 dark:bg-white/5 px-2 py-1 rounded-full " +
        (className || "")
      }
      style={{ backgroundColor: ETAPA_COLORS[etapa] }}
    >
      {etapaLabel(etapa)}
    </span>
  );
}
