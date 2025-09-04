"use client";

import React from "react";

type Props = {
  isAtrasado: boolean;
  className?: string;
};

export default function ProjectPrazoBadge({ isAtrasado, className }: Props) {
  const base = "inline-flex items-center gap-2 px-2 py-1 rounded-full ";
  const color = isAtrasado
    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
  return <span className={base + color + (className ? " " + className : "")}>{isAtrasado ? "Atrasado" : "Em dia"}</span>;
}

