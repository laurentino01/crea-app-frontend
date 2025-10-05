"use client";

import React from "react";
import type { tProjetoCriticidade } from "@/@types/tProject";
import { PrioridadeProjeto } from "@/@types/tProject";

type Props = {
  criticidade: tProjetoCriticidade;
  className?: string;
};

function criticidadeLabel(c: tProjetoCriticidade): string {
  switch (c) {
    case PrioridadeProjeto.BAIXA:
      return "Baixa";
    case PrioridadeProjeto.MEDIA:
      return "Média";
    case PrioridadeProjeto.ALTA:
      return "Alta";
    case PrioridadeProjeto.URGENTE:
      return "Urgente";
    case PrioridadeProjeto.CRITICO:
      return "Urgente";
    default:
      return String(c);
  }
}

function criticidadeClass(c: tProjetoCriticidade): string {
  switch (c) {
    case PrioridadeProjeto.BAIXA:
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
    case PrioridadeProjeto.MEDIA:
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    case PrioridadeProjeto.ALTA:
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    case PrioridadeProjeto.URGENTE:
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case PrioridadeProjeto.CRITICO:
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    default:
      return "bg-neutral-100 text-neutral-800 dark:bg-white/5 dark:text-neutral-300";
  }
}

export default function ProjectCriticidadeBadge({
  criticidade,
  className,
}: Props) {
  return (
    <span
      className={
        "inline-flex items-center gap-2 px-2 py-1 rounded-full " +
        criticidadeClass(criticidade) +
        (className ? " " + className : "")
      }
    >
      {criticidadeLabel(criticidade)}
    </span>
  );
}
