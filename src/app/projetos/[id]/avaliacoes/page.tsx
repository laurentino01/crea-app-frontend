"use client";

import Avatar from "@/components/Avatar";
import { Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { projectService } from "@/services/LocalStorageProjectService";
import { userService } from "@/services/LocalStorageUserService";
import type { tIdUsuario } from "@/@types/tProject";
import {
  Dificuldade,
  TipoCriterio,
  type tCriterioAvaliacao,
} from "@/@types/tAvaliacao";
import { fetchCriterios } from "@/usecases/fetchCriterios";
import { criteriaService } from "@/services/LocalStorageCriteriaService";
import { avaliacaoService } from "@/services/LocalStorageAvaliacaoService";
import { pontuacaoService } from "@/services/LocalStoragePontuacaoService";
import { recomputePontuacao } from "@/usecases/recomputePontuacao";
import { seedCriteriosToLocalStorage } from "@/lib/criterios.localstorage";

export default function projetoDetalhesAvaliacoes() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id as string | undefined;

  const [isAddOpen, setIsAddOpen] = useState(false);

  // Equipe do projeto
  const [team, setTeam] = useState<{ id: tIdUsuario; nome: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");

  // Dificuldade
  const [dificuldade, setDificuldade] = useState<Dificuldade>(
    Dificuldade.medio
  );

  // Critérios carregados do localStorage via usecase/service
  const [criteriosPositivos, setCriteriosPositivos] = useState<
    tCriterioAvaliacao[]
  >([]);
  const [criteriosAdvertencia, setCriteriosAdvertencia] = useState<
    tCriterioAvaliacao[]
  >([]);

  const [positivosSelecionados, setPositivosSelecionados] = useState<
    Set<string>
  >(new Set());
  const [advertenciasSelecionadas, setAdvertenciasSelecionadas] = useState<
    Set<string>
  >(new Set());

  // Lista de pontuações do projeto (para exibir ranking)
  const [pontuacoes, setPontuacoes] = useState<
    Array<{
      idUsuario: string;
      nome: string;
      positivos: number;
      advertencias: number;
      total: number;
      dificuldade: Dificuldade;
    }>
  >([]);

  useEffect(() => {
    seedCriteriosToLocalStorage();

    async function loadTeam() {
      if (!projectId) return;
      const proj = await projectService.findById(projectId);
      if (!proj) return;
      const users = await userService.findAll();
      const idsEquipe = new Set((proj.equipe ?? []).map((m) => m.idUsuario));
      const equipeNomes = users
        .filter((u) => idsEquipe.has(u.id))
        .map((u) => ({ id: u.id, nome: u.nomeCompleto || u.apelido || "—" }));
      setTeam(equipeNomes);
    }
    async function loadCriterios() {
      try {
        const all = await fetchCriterios(criteriaService);
        setCriteriosPositivos(
          all.filter((c) => c.tipoCriterio === TipoCriterio.Positivo)
        );
        setCriteriosAdvertencia(
          all.filter((c) => c.tipoCriterio === TipoCriterio.Advertencia)
        );
      } catch {
        setCriteriosPositivos([]);
        setCriteriosAdvertencia([]);
      }
    }
    async function loadPontuacoes() {
      if (!projectId) return;
      const ps = await pontuacaoService.listByProjeto(projectId);
      const users = await userService.findAll();
      const byUser = ps
        .map((p) => {
          const u = users.find((uu) => uu.id === p.idUsuario);
          return {
            idUsuario: p.idUsuario,
            nome: u?.nomeCompleto || u?.apelido || "—",
            positivos: p.positivos?.ponto ?? 0,
            advertencias: p.advertencia?.ponto ?? 0,
            total: p.pontuacao,
            dificuldade: p.dificuldade,
          };
        })
        .sort((a, b) => b.total - a.total);
      setPontuacoes(byUser);
    }
    loadTeam();
    loadCriterios();
    loadPontuacoes();
  }, [projectId]);

  const totalPositivos = useMemo(() => {
    return criteriosPositivos
      .filter((c) => positivosSelecionados.has(c.id))
      .reduce((sum, c) => sum + c.ponto, 0);
  }, [criteriosPositivos, positivosSelecionados]);

  const totalAdvertencias = useMemo(() => {
    return criteriosAdvertencia
      .filter((c) => advertenciasSelecionadas.has(c.id))
      .reduce((sum, c) => sum + c.ponto, 0);
  }, [criteriosAdvertencia, advertenciasSelecionadas]);

  const totalFinal = useMemo(() => {
    const base = totalPositivos - totalAdvertencias;
    return Math.max(0, base * Number(dificuldade));
  }, [totalPositivos, totalAdvertencias, dificuldade]);

  function togglePositivo(id: string) {
    setPositivosSelecionados((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAdvertencia(id: string) {
    setAdvertenciasSelecionadas((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function openEditForUser(userId: string) {
    setSelectedUser(userId);
    // Prefill critérios e dificuldade a partir do que estiver salvo
    const avals = await avaliacaoService.listByProjetoUsuario(
      projectId!,
      userId
    );
    const pos = new Set<string>();
    const adv = new Set<string>();
    avals.forEach((a) => {
      if (a.idCriterio.tipoCriterio === TipoCriterio.Positivo) pos.add(a.idCriterio.id);
      if (a.idCriterio.tipoCriterio === TipoCriterio.Advertencia)
        adv.add(a.idCriterio.id);
    });
    setPositivosSelecionados(pos);
    setAdvertenciasSelecionadas(adv);
    const p = await pontuacaoService.findByProjetoUsuario(projectId!, userId);
    setDificuldade(p?.dificuldade ?? Dificuldade.medio);
    setIsAddOpen(true);
  }

  return (
    <>
      <div className="flex justify-end">
        <button
          className="flex gap-3 items-center px-3 py-2 rounded-full bg-fuchsia-900 text-white hover:bg-fuchsia-700 disabled:opacity-50 cursor-pointer"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus size={16} />
          Nova Avaliação
        </button>
      </div>

      {/* Modal Nova Avaliação */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-lg bg-white dark:bg-neutral-900 p-4 sm:p-6 shadow-xl text-neutral-900 dark:text-neutral-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Nova Avaliação
              </h2>
              <button
                aria-label="Fechar"
                className="p-1 cursor-pointer rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setIsAddOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Seleções principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                  Membro da equipe
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                >
                  <option value="">Selecionar...</option>
                  {team.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                  Dificuldade (multiplicador)
                </label>
                <select
                  value={dificuldade}
                  onChange={(e) =>
                    setDificuldade(Number(e.target.value) as Dificuldade)
                  }
                  className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                >
                  <option value={Dificuldade.facil}>Fácil (x1)</option>
                  <option value={Dificuldade.medio}>Médio (x2)</option>
                  <option value={Dificuldade.dificil}>Difícil (x3)</option>
                  <option value={Dificuldade.hardcore}>Hardcore (x5)</option>
                </select>
              </div>
            </div>

            {/* Critérios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3">
                <div className="text-sm font-medium mb-2">
                  Criterios Positivos
                </div>
                <div className="space-y-2 max-h-60 overflow-auto pr-1">
                  {criteriosPositivos.map((c) => {
                    const checked = positivosSelecionados.has(c.id);
                    return (
                      <label
                        key={c.id}
                        className="flex items-center justify-between gap-3 text-sm cursor-pointer select-none rounded-md p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <span className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePositivo(c.id)}
                            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-fuchsia-700 focus:ring-fuchsia-600"
                          />
                          {c.criterio}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          +{c.ponto}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3">
                <div className="text-sm font-medium mb-2">Advertências</div>
                <div className="space-y-2 max-h-60 overflow-auto pr-1">
                  {criteriosAdvertencia.map((c) => {
                    const checked = advertenciasSelecionadas.has(c.id);
                    return (
                      <label
                        key={c.id}
                        className="flex items-center justify-between gap-3 text-sm cursor-pointer select-none rounded-md p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <span className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAdvertencia(c.id)}
                            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-fuchsia-700 focus:ring-fuchsia-600"
                          />
                          {c.criterio}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                          -{c.ponto}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Resumo */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-neutral-100 dark:bg-white/5 p-3 text-center">
                <div className="text-xs text-neutral-500 mb-1">Positivos</div>
                <div className="font-extrabold text-green-700 dark:text-green-300">
                  +{totalPositivos}
                </div>
              </div>
              <div className="rounded-lg bg-neutral-100 dark:bg-white/5 p-3 text-center">
                <div className="text-xs text-neutral-500 mb-1">
                  Advertências
                </div>
                <div className="font-extrabold text-red-700 dark:text-red-300">
                  -{totalAdvertencias}
                </div>
              </div>
              <div className="rounded-lg bg-neutral-100 dark:bg-white/5 p-3 text-center">
                <div className="text-xs text-neutral-500 mb-1">
                  Multiplicador
                </div>
                <div className="font-extrabold">x{Number(dificuldade)}</div>
              </div>
              <div className="rounded-lg bg-neutral-100 dark:bg-white/5 p-3 text-center">
                <div className="text-xs text-neutral-500 mb-1">Total</div>
                <div className="font-extrabold">{totalFinal}</div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                className="cursor-pointer inline-flex items-center gap-2 bg-fuchsia-900 hover:bg-purple-400 active:bg-fuchsia-950 text-white rounded-md px-4 py-2 disabled:opacity-50"
                onClick={async () => {
                  if (!projectId || !selectedUser) return;
                  // Monta a lista de avaliações com base nos selecionados
                  const selecionados: tCriterioAvaliacao[] = [
                    ...criteriosPositivos.filter((c) =>
                      positivosSelecionados.has(c.id)
                    ),
                    ...criteriosAdvertencia.filter((c) =>
                      advertenciasSelecionadas.has(c.id)
                    ),
                  ];
                  const registros = selecionados.map((c) => ({
                    idProjeto: projectId,
                    idUsuario: selectedUser,
                    idCriterio: c,
                  }));
                  // Substitui o conjunto vigente do usuário nesse projeto
                  await avaliacaoService.replaceForProjetoUsuario(
                    projectId,
                    selectedUser,
                    registros
                  );
                  // Recalcula e atualiza a pontuação agregada
                  await recomputePontuacao(avaliacaoService, pontuacaoService, {
                    idProjeto: projectId,
                    idUsuario: selectedUser,
                    dificuldade,
                  });
                  // Atualiza ranking local
                  const ps = await pontuacaoService.listByProjeto(projectId);
                  const users = await userService.findAll();
                  const byUser = ps
                    .map((p) => {
                      const u = users.find((uu) => uu.id === p.idUsuario);
                      return {
                        idUsuario: p.idUsuario,
                        nome: u?.nomeCompleto || u?.apelido || "—",
                        positivos: p.positivos?.ponto ?? 0,
                        advertencias: p.advertencia?.ponto ?? 0,
                        total: p.pontuacao,
                        dificuldade: p.dificuldade,
                      };
                    })
                    .sort((a, b) => b.total - a.total);
                  setPontuacoes(byUser);
                  // Reset estado e fecha modal
                  setIsAddOpen(false);
                  setSelectedUser("");
                  setPositivosSelecionados(new Set());
                  setAdvertenciasSelecionadas(new Set());
                  setDificuldade(Dificuldade.medio);
                }}
                disabled={!selectedUser}
              >
                Salvar avaliação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de membros avaliados (ordenada por maior pontuação) */}
      <div className="space-y-3 mt-8">
        {pontuacoes.length === 0 && (
          <div className="text-sm text-neutral-500">
            Nenhuma avaliação registrada para este projeto.
          </div>
        )}
        {pontuacoes.map((p, idx) => (
          <div
            key={p.idUsuario}
            className="flex justify-between items-center border border-neutral-200 dark:border-neutral-800 rounded-md p-4"
          >
            <div className="flex gap-3 items-center">
              <div className="text-xs w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-semibold">
                {idx + 1}
              </div>
              <Avatar name={p.nome} />
              <div className="font-medium">{p.nome}</div>
              <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800">
                x{Number(p.dificuldade)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-green-700 dark:text-green-300 text-sm">
                +{p.positivos}
              </div>
              <div className="text-red-700 dark:text-red-300 text-sm">
                -{p.advertencias}
              </div>
              <div className="font-semibold text-sm">{p.total}</div>
              <button
                className="ml-2 text-xs px-3 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                onClick={() => openEditForUser(p.idUsuario)}
              >
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
