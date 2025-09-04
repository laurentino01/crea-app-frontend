"use client";

import React from "react";
import type { tProjetoEtapa } from "@/@types/tProject";
import { ProjetoEtapa } from "@/@types/tProject";

type Props = {
  etapa: tProjetoEtapa;
  className?: string;
};

function etapaLabel(etapa: tProjetoEtapa): string {
  switch (etapa) {
    case ProjetoEtapa.AguardandoArquivos:
      return "Aguardando arquivos";
    case ProjetoEtapa.Decupagem:
      return "Decupagem";
    case ProjetoEtapa.Revisao:
      return "Revisão";
    case ProjetoEtapa.Sonorizacao:
      return "Sonorização";
    case ProjetoEtapa.PosProducao:
      return "Pós-produção";
    case ProjetoEtapa.Analise:
      return "Análise";
    case ProjetoEtapa.Concluido:
      return "Concluído";
    case ProjetoEtapa.Descontinuado:
      return "Descontinuado";
    default:
      return String(etapa);
  }
}

export default function ProjectEtapaBadge({ etapa, className }: Props) {
  return (
    <span
      className={
        "inline-flex items-center gap-2 bg-neutral-100 dark:bg-white/5 px-2 py-1 rounded-full " +
        (className || "")
      }
    >
      <span className="w-2 h-2 rounded-full bg-fuchsia-600" />
      {etapaLabel(etapa)}
    </span>
  );
}

