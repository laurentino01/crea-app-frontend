"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import ProgressBar from "@/components/ProgressBar";
import ProjectEtapaBadge from "@/components/ProjectEtapaBadge";
import ProjectCriticidadeBadge from "@/components/ProjectCriticidadeBadge";
import ProjectPrazoBadge from "@/components/ProjectPrazoBadge";

import { projectService } from "@/services/LocalStorageProjectService";
import type {
  tProjectPersisted,
  tProjetoEtapa,
  tProjetoEtapaItem,
} from "@/@types/tProject";
import { ProjetoEtapaStatus } from "@/@types/tProject";
import DetailTabs from "@/components/DetailTabs";

// Progresso baseado no status por etapa
function etapasProgressPct(etapas: tProjetoEtapaItem[] | undefined): number {
  if (!etapas || etapas.length === 0) return 0;
  const allDescont = etapas.every((e) => e.status === ProjetoEtapaStatus.Descontinuado);
  // Se todas as etapas estão descontinuadas, progresso deve ser 0%
  if (allDescont) return 0;
  const valid = etapas.filter((e) => e.status !== ProjetoEtapaStatus.Descontinuado);
  if (valid.length === 0) return 0;
  const done = valid.filter((e) => e.status === ProjetoEtapaStatus.Concluido).length;
  return Math.round((done / valid.length) * 100);
}

export default function projetoDetalhesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const params = useParams<{ id: string }>();
  const projectId = params?.id as string | undefined;

  const [project, setProject] = useState<tProjectPersisted | null>(null);
  const [etapas, setEtapas] = useState<tProjetoEtapaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        if (!projectId) return;
        const proj = await projectService.findById(projectId);
        const etps = await projectService.getEtapas(projectId);
        if (!proj) {
          setError("Projeto não encontrado");
          return;
        }
        setProject(proj);
        setEtapas(etps);
      } finally {
        setLoading(false);
      }
    }
    load();
    // escuta atualizações
    function onUpdated(e: any) {
      if (e?.detail?.id === projectId) load();
    }
    if (typeof window !== "undefined") {
      window.addEventListener("project-updated", onUpdated as any);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("project-updated", onUpdated as any);
      }
    };
  }, [projectId]);

  const progress = useMemo(() => etapasProgressPct(etapas), [etapas]);

  return (
    <main className="space-y-4">
      {/* Cabeçalho do projeto (compartilhado entre as rotas filhas) */}
      {!loading && project && (
        <section className="rounded-lg p-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div className="min-w-0 flex">
              <div className="flex items-center gap-4">
                <Link
                  href="/projetos"
                  className="inline-flex h-8 items-center gap-2 text-sm px-3 py-2 rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <ArrowLeft size={16} /> Voltar
                </Link>
                <div>
                  <h1 className="text-xl font-extrabold truncate">
                    {project.nome}
                  </h1>
                  {project.descricao && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 truncate">
                      {project.descricao}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ProjectEtapaBadge etapa={project.etapa} />
              <ProjectCriticidadeBadge criticidade={project.criticidade} />
              {typeof project.isAtrasado === "boolean" && (
                <ProjectPrazoBadge isAtrasado={project.isAtrasado} />
              )}
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar value={progress} showLabel size="md" />
          </div>
        </section>
      )}
      {/* Tabs */}
      <DetailTabs
        items={[
          { label: "Informações", href: `` },
          { label: "Equipe", href: `equipe` },
          { label: "Avaliações", href: "#avaliacoes" },
          { label: "Chat", href: "#chat" },
          { label: "Histórico", href: "#historico" },
          { label: "Workflow", href: "workflow" },
        ]}
        justify="between"
      />

      {/* Conteúdo específico da página */}
      {children}
    </main>
  );
}
