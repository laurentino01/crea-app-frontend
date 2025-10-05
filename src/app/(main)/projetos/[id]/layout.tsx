"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import ProjectEtapaBadge from "@/components/ProjectEtapaBadge";
import ProjectCriticidadeBadge from "@/components/ProjectCriticidadeBadge";
import ProjectPrazoBadge from "@/components/ProjectPrazoBadge";
import { projectService } from "@/services/api/ProjetoService";
import type { tProject, tProjetoEtapaItem } from "@/@types/tProject";
import { EtapaStatus, ProjetoEtapa } from "@/@types/tProject";
import DetailTabs from "@/components/DetailTabs";
import { findById, findByProjetoEStatus } from "@/usecases/projetoCases";

enum eTabs {
  informacoes = "informacoes",
  equipe = "equipe",
  avaliacoes = "avaliacoes",
  chat = "chat",
  historico = "historico",
  workflow = "workflow",
}

export default function projetoDetalhesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<tProject | null>(null);
  const [etapa, setEtapa] = useState<tProjetoEtapaItem>();
  const [currentTab, setCurrentTab] = useState<eTabs>(eTabs.informacoes);
  const [progresso, setProgresso] = useState(0);

  const tabsTitle = {
    informacoes: { title: "Informações do Projeto" },
    equipe: { title: "Equipe do Projeto" },
    avaliacoes: { title: "Avaliação de desempenho" },
    chat: { title: "Chat do projeto" },
    historico: { title: "histórico do projeto" },
    workflow: { title: "workflow do projeto" },
  };

  async function findProjetoInfos() {
    const res = await findById(projectService, Number(id));
    if (res) {
      setProject(res);
    }
  }
  async function findEtapa() {
    const res = await findByProjetoEStatus(
      projectService,
      Number(id),
      EtapaStatus.ANDAMENTO
    );
    if (res) {
      setEtapa(res);
      setProgresso(
        Object.keys(ProjetoEtapa).filter((etapa) => etapa !== res.etapa).length
      );
    }
  }

  useEffect(() => {
    findProjetoInfos();
    findEtapa();
  }, []);

  return (
    <main className="space-y-4">
      {/* Cabeçalho do projeto (compartilhado entre as rotas filhas) */}

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
                  {project?.nome}
                </h1>
                {project?.descricao && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 truncate">
                    {project.descricao}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ProjectEtapaBadge etapa={etapa?.etapa!} />
            <ProjectCriticidadeBadge criticidade={project?.prioridade!} />
            {typeof project?.progressoStatus === "boolean" && (
              <ProjectPrazoBadge isAtrasado={project.progressoStatus} />
            )}
          </div>
        </div>
        <div className="mt-3">
          <ProgressBar value={progresso} showLabel size="md" />
        </div>
      </section>

      <DetailTabs
        items={[
          { label: "Informações", href: `` },
          { label: "Equipe", href: `equipe` },
          { label: "Avaliações", href: "avaliacoes" },
          { label: "Chat", href: "chat" },
          { label: "Histórico", href: "historico" },
          { label: "Workflow", href: "workflow" },
        ]}
        justify="between"
      />

      <section className="rounded-lg dark:bg-neutral-900 bg-neutral-100 p-4">
        <div className="flex items-center mb-4 gap-2">
          <h2 className="text-base font-semibold">
            {tabsTitle[currentTab].title}
          </h2>
        </div>
        {children}
      </section>
    </main>
  );
}
