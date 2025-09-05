"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { projectService } from "@/services/LocalStorageProjectService";
import { userService } from "@/services/LocalStorageUserService";
import type {
  tProjectPersisted,
  tProjetoEtapaItem,
  tProjetoEtapa,
} from "@/@types/tProject";
import { ProjetoEtapa, ProjetoEtapaStatus } from "@/@types/tProject";
import { fetchProjectEtapas } from "@/usecases/fetchProjectEtapas";
import { updateProjectEtapaItem } from "@/usecases/updateProjectEtapaItem";
import { concludeProject } from "@/usecases/concludeProject";
import { discontinueProject } from "@/usecases/discontinueProject";
import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";

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
    default:
      return String(etapa);
  }
}

const BASE_ORDER: tProjetoEtapa[] = [
  ProjetoEtapa.AguardandoArquivos,
  ProjetoEtapa.Decupagem,
  ProjetoEtapa.Revisao,
  ProjetoEtapa.Sonorizacao,
  ProjetoEtapa.PosProducao,
  ProjetoEtapa.Analise,
];

const statusOptions: { value: ProjetoEtapaStatus; label: string }[] = [
  { value: ProjetoEtapaStatus.NaoIniciado, label: "Não iniciado" },
  { value: ProjetoEtapaStatus.EmAndamento, label: "Em andamento" },
  { value: ProjetoEtapaStatus.Concluido, label: "Concluído" },
  { value: ProjetoEtapaStatus.Descontinuado, label: "Descontinuado" },
];

export default function ProjetoDetalhesWorkflowPage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id as string | undefined;

  const [project, setProject] = useState<tProjectPersisted | null>(null);
  const [etapas, setEtapas] = useState<tProjetoEtapaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingEtapa, setUpdatingEtapa] = useState<tProjetoEtapa | null>(
    null
  );
  const [quickActionLoading, setQuickActionLoading] = useState<
    "conclude" | "discontinue" | null
  >(null);

  // Seleção de responsável para movimentar etapa
  const [selectOpen, setSelectOpen] = useState(false);
  const [targetEtapa, setTargetEtapa] = useState<tProjetoEtapa | null>(null);
  const [selectedResponsavelId, setSelectedResponsavelId] =
    useState<string>("");
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  // Navegação direta entre etapas

  useEffect(() => {
    async function load() {
      try {
        if (!projectId) return;
        const [proj, etps, users] = await Promise.all([
          projectService.findById(projectId),
          fetchProjectEtapas(projectService, projectId),
          userService.findAll(),
        ]);
        if (!proj) {
          setError("Projeto não encontrado");
          return;
        }
        setProject(proj);
        setEtapas(etps);
        setUserNames(
          Object.fromEntries(
            users.map((u) => [u.id, u.nomeCompleto || u.apelido || "—"]) as [
              string,
              string
            ][]
          )
        );
      } finally {
        setLoading(false);
      }
    }
    load();
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

  const etapasByEtapa = useMemo(() => {
    const map = new Map<tProjetoEtapa, tProjetoEtapaItem>();
    etapas.forEach((e) => map.set(e.etapa, e));
    return map;
  }, [etapas]);

  async function setStatus(etapa: tProjetoEtapa, status: ProjetoEtapaStatus) {
    if (!projectId) return;
    try {
      setError(null);
      setUpdatingEtapa(etapa);
      await updateProjectEtapaItem(projectService, projectId, etapa, {
        status,
      });
      // estado será atualizado pelo evento project-updated
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar a etapa."
      );
    } finally {
      setUpdatingEtapa(null);
    }
  }

  async function setResponsavelEtapa(
    etapa: tProjetoEtapa,
    responsavel: string
  ) {
    if (!projectId) return;
    try {
      setError(null);
      setUpdatingEtapa(etapa);
      await updateProjectEtapaItem(projectService, projectId, etapa, {
        responsavel,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível definir o responsável."
      );
    } finally {
      setUpdatingEtapa(null);
    }
  }

  async function handleConcludeProject() {
    if (!projectId) return;
    try {
      setError(null);
      setQuickActionLoading("conclude");
      await concludeProject(projectService, projectId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível concluir o projeto."
      );
    } finally {
      setQuickActionLoading(null);
    }
  }

  async function handleDiscontinueProject() {
    if (!projectId) return;
    try {
      setError(null);
      setQuickActionLoading("discontinue");
      await discontinueProject(projectService, projectId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível descontinuar o projeto."
      );
    } finally {
      setQuickActionLoading(null);
    }
  }

  function indexOfEtapa(e: tProjetoEtapa): number {
    return BASE_ORDER.indexOf(e);
  }

  async function goToEtapa(target: tProjetoEtapa) {
    if (!projectId) return;
    try {
      setError(null);
      setUpdatingEtapa(target);
      const targetIdx = indexOfEtapa(target);
      if (targetIdx === -1) return;

      // Atualiza statuses de todas as etapas conforme o alvo
      for (let i = 0; i < BASE_ORDER.length; i++) {
        const et = BASE_ORDER[i];
        const desiredStatus:
          | ProjetoEtapaStatus.EmAndamento
          | ProjetoEtapaStatus.Concluido
          | ProjetoEtapaStatus.NaoIniciado =
          i < targetIdx
            ? ProjetoEtapaStatus.Concluido
            : i === targetIdx
            ? ProjetoEtapaStatus.EmAndamento
            : ProjetoEtapaStatus.NaoIniciado;

        const current = etapasByEtapa.get(et);
        if (current?.status !== desiredStatus) {
          const changes: any = { status: desiredStatus };
          // Se a etapa alvo ficará ativa, define o responsável escolhido
          if (
            et === target &&
            desiredStatus === ProjetoEtapaStatus.EmAndamento &&
            selectedResponsavelId
          ) {
            changes.responsavel = selectedResponsavelId;
          }
          await updateProjectEtapaItem(projectService, projectId, et, changes);
        }
      }

      await projectService.changeEtapa(projectId, target);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível alterar a etapa."
      );
    } finally {
      setUpdatingEtapa(null);
    }
  }

  // Abre modal para selecionar responsável antes de mudar etapa
  function openResponsavelModal(target: tProjetoEtapa) {
    if (!project) return;
    const equipeIds = new Set((project.equipe ?? []).map((m) => m.idUsuario));
    if (equipeIds.size === 0) {
      setError(
        "Adicione membros à equipe do projeto antes de alterar a etapa."
      );
      return;
    }
    setTargetEtapa(target);
    // Pré-seleciona o responsável já atribuído na etapa alvo (se houver)
    const currentResp = etapasByEtapa.get(target)?.responsavel || "";
    if (currentResp && equipeIds.has(currentResp)) {
      setSelectedResponsavelId(currentResp);
    } else {
      // Se não houver, tenta selecionar o primeiro membro da equipe
      const first = (project.equipe ?? [])[0]?.idUsuario || "";
      setSelectedResponsavelId(first);
    }
    setSelectOpen(true);
  }

  async function confirmResponsavelAndGo() {
    if (!projectId || !project || !targetEtapa) return;
    const equipeIds = new Set((project.equipe ?? []).map((m) => m.idUsuario));
    if (!selectedResponsavelId || !equipeIds.has(selectedResponsavelId)) {
      setError("Selecione um membro válido da equipe.");
      return;
    }
    setSelectOpen(false);
    await goToEtapa(targetEtapa);
    setTargetEtapa(null);
  }

  if (loading) {
    return (
      <div className="py-10 text-center text-neutral-600 dark:text-neutral-300">
        Carregando...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-10 text-center text-neutral-600 dark:text-neutral-300">
        {error || "Projeto não encontrado"}
      </div>
    );
  }

  const equipeIds = new Set((project.equipe ?? []).map((m) => m.idUsuario));

  return (
    <>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 mb-3">
          {error}
        </div>
      )}

      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Ações rápidas
          </h3>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 rounded-md bg-green-500 text-white hover:bg-green-700 disabled:opacity-50 cursor-pointer transition-colors "
              onClick={handleConcludeProject}
              disabled={quickActionLoading !== null}
            >
              {quickActionLoading === "conclude"
                ? "Concluindo…"
                : "Concluir projeto"}
            </button>
            <button
              className="px-3 py-2 rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
              onClick={handleDiscontinueProject}
              disabled={quickActionLoading !== null}
            >
              {quickActionLoading === "discontinue"
                ? "Descontinuando…"
                : "Descontinuar"}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {BASE_ORDER.map((et) => {
          const item = etapasByEtapa.get(et);
          const status = item?.status ?? ProjetoEtapaStatus.NaoIniciado;
          const cardClass = (() => {
            if (status === ProjetoEtapaStatus.EmAndamento) {
              return "rounded-lg p-3 border border-fuchsia-200 dark:border-fuchsia-900 bg-fuchsia-50 dark:bg-fuchsia-950/40";
            }
            if (status === ProjetoEtapaStatus.Concluido) {
              return "rounded-lg p-3 border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40";
            }
            return "rounded-lg p-3 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900";
          })();
          return (
            <div key={et} className={cardClass}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="text-sm font-medium">{etapaLabel(et)}</div>
                  <div className="text-xs text-neutral-500">
                    {item?.dataInicio ? (
                      <>
                        Início:{" "}
                        {new Date(item.dataInicio).toLocaleString("pt-BR")}
                        {item?.dataFim && (
                          <>
                            {" "}
                            • Fim:{" "}
                            {new Date(item.dataFim).toLocaleString(
                              "pt-BR"
                            )}{" "}
                          </>
                        )}
                      </>
                    ) : (
                      <>Sem início registrado</>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    Responsável:{" "}
                    {item?.responsavel
                      ? userNames[item.responsavel] || item.responsavel
                      : "—"}
                  </div>
                </div>
                {(() => {
                  const isDoneProject =
                    project.etapa === ProjetoEtapa.Concluido ||
                    project.etapa === ProjetoEtapa.Descontinuado;
                  const currentIdx = indexOfEtapa(
                    project.etapa as tProjetoEtapa
                  );
                  const thisIdx = indexOfEtapa(et);

                  const showBack = isDoneProject
                    ? true
                    : thisIdx !== -1 &&
                      currentIdx !== -1 &&
                      thisIdx < currentIdx;
                  const showNext = isDoneProject
                    ? false
                    : thisIdx !== -1 &&
                      currentIdx !== -1 &&
                      thisIdx > currentIdx;

                  if (!showBack && !showNext) return null;

                  return (
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      {showBack && (
                        <button
                          className="cursor-pointer border px-3 rounded-md items-center flex gap-2 py-2 border-neutral-200 dark:border-neutral-800 disabled:opacity-50"
                          onClick={() => openResponsavelModal(et)}
                          disabled={
                            !!updatingEtapa || quickActionLoading !== null
                          }
                        >
                          <ArrowLeftToLine size={22} /> Voltar
                        </button>
                      )}
                      {showNext && (
                        <button
                          className="cursor-pointer px-3 rounded-md items-center flex gap-2 py-2 bg-green-500 disabled:opacity-50"
                          onClick={() => openResponsavelModal(et)}
                          disabled={
                            !!updatingEtapa || quickActionLoading !== null
                          }
                        >
                          Avançar <ArrowRightToLine size={22} />
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de seleção de responsável */}
      {selectOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-lg bg-white dark:bg-neutral-900 p-4 sm:p-6 shadow-xl text-neutral-900 dark:text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Selecionar responsável da etapa
              </h2>
            </div>
            <div className="space-y-3">
              <div className="text-sm text-neutral-700 dark:text-neutral-300">
                {targetEtapa ? `Etapa: ${etapaLabel(targetEtapa)}` : ""}
              </div>
              {(project.equipe ?? []).length === 0 ? (
                <div className="text-sm text-neutral-500">
                  Nenhum membro na equipe. Adicione membros na aba Equipe do
                  projeto.
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <label className="text-sm">Responsável</label>
                  <select
                    value={selectedResponsavelId}
                    onChange={(e) => setSelectedResponsavelId(e.target.value)}
                    className="cursor-pointer rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-2 text-sm"
                  >
                    {(project.equipe ?? []).map((m) => (
                      <option key={m.idUsuario} value={m.idUsuario}>
                        {userNames[m.idUsuario] || m.idUsuario}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                className="px-3 py-2 rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                onClick={() => setSelectOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="px-3 py-2 rounded-md bg-fuchsia-900 text-white hover:bg-fuchsia-700 disabled:opacity-50 cursor-pointer"
                disabled={(project.equipe ?? []).length === 0}
                onClick={confirmResponsavelAndGo}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
