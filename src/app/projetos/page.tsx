"use client";

import { useEffect, useMemo, useState } from "react";
import SearchInput from "@/components/SearchInput";
import Card from "@/components/Card";
import Avatar from "@/components/Avatar";
import { projectService } from "@/services/LocalStorageProjectService";
import { clientService } from "@/services/LocalStorageClientService";
import { userService } from "@/services/LocalStorageUserService";
import type { tProjectPersisted, tProjetoEtapa } from "@/@types/tProject";
import { ProjetoEtapa } from "@/@types/tProject";

type AtrasoFilter = "all" | "late" | "on_time";

const etapaOptions: { value: tProjetoEtapa; label: string }[] = [
  { value: ProjetoEtapa.AguardandoArquivos, label: "Aguardando arquivos" },
  { value: ProjetoEtapa.Decupagem, label: "Decupagem" },
  { value: ProjetoEtapa.Revisao, label: "Revisão" },
  { value: ProjetoEtapa.Sonorizacao, label: "Sonorização" },
  { value: ProjetoEtapa.PosProducao, label: "Pós-produção" },
  { value: ProjetoEtapa.Analise, label: "Análise" },
  { value: ProjetoEtapa.Concluido, label: "Concluído" },
  { value: ProjetoEtapa.Descontinuado, label: "Descontinuado" },
];

export default function Projetos() {
  const [projects, setProjects] = useState<tProjectPersisted[]>([]);
  const [search, setSearch] = useState("");
  const [etapaFilter, setEtapaFilter] = useState<"all" | tProjetoEtapa>("all");
  const [atrasoFilter, setAtrasoFilter] = useState<AtrasoFilter>("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Lookup maps for client and user names
  const [clientNames, setClientNames] = useState<Record<string, string>>({});
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadLookups() {
      const [clients, users] = await Promise.all([
        clientService.findAll(),
        userService.findAll(),
      ]);
      setClientNames(
        Object.fromEntries(clients.map((c) => [c.id, c.nome ?? "—"]))
      );
      setUserNames(
        Object.fromEntries(
          users.map((u) => [u.id, u.nomeCompleto || u.apelido || "—"])
        )
      );
    }
    loadLookups();
  }, []);

  async function reload() {
    const etapa = etapaFilter === "all" ? undefined : etapaFilter;
    const isAtrasado =
      atrasoFilter === "all"
        ? undefined
        : atrasoFilter === "late"
        ? true
        : false;

    const list = await projectService.findAll({ search, etapa, isAtrasado });
    setProjects(list);
  }

  useEffect(() => {
    reload();
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, etapaFilter, atrasoFilter]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(projects.length / pageSize));
  }, [projects.length]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return projects.slice(start, start + pageSize);
  }, [projects, page]);

  const etapaLabel = (e: tProjetoEtapa) =>
    etapaOptions.find((x) => x.value === e)?.label ?? e;

  return (
    <>
      {/* Toolbar */}
      <section className="w-full bg-neutral-50 dark:bg-neutral-900 py-5 px-2 rounded-lg flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-3xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <SearchInput
            placeholder="Buscar por nome, cliente ou descrição"
            value={search}
            onChange={setSearch}
            size="md"
            className="flex-1"
          />

          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-700 dark:text-neutral-300">
              Etapa
            </label>
            <select
              value={etapaFilter}
              onChange={(e) =>
                setEtapaFilter(
                  (e.target.value as "all" | tProjetoEtapa) ?? "all"
                )
              }
              className="cursor-pointer rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-2 text-sm"
            >
              <option value="all">Todas</option>
              {etapaOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-700 dark:text-neutral-300">
              Prazo
            </label>
            <select
              value={atrasoFilter}
              onChange={(e) => setAtrasoFilter(e.target.value as AtrasoFilter)}
              className="cursor-pointer rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="late">Atrasados</option>
              <option value="on_time">Em dia</option>
            </select>
          </div>
        </div>

        {/* Placeholders only; sem ações funcionais agora */}
        <div className="flex justify-end opacity-60 select-none">
          <button
            className="flex gap-2 items-center bg-fuchsia-900 rounded-full py-2 px-4 text-neutral-50 cursor-not-allowed"
            disabled
          >
            Adicionar Projeto
          </button>
        </div>
      </section>

      {/* Lista */}
      <section className="mt-6">
        {projects.length === 0 ? (
          <div className="text-center text-neutral-600 dark:text-neutral-400 py-16">
            Nenhum projeto encontrado.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pageItems.map((p, idx) => {
                const name = p.nome;
                const cliente = clientNames[p.cliente] || "—";
                const responsavel = userNames[p.responsavel] || "—";

                return (
                  <Card key={idx}>
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-[18px] text-white ">
                        {<Avatar name={name} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold mb-1 truncate">{name}</div>
                        <div className="text-[13px] text-neutral-500 truncate">
                          Cliente: {cliente}
                        </div>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
                      <span className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-white/5 px-2 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-fuchsia-600" />
                        {etapaLabel(p.etapa)}
                      </span>
                      {typeof p.isAtrasado === "boolean" && (
                        <span
                          className={
                            "inline-flex items-center gap-2 px-2 py-1 rounded-full " +
                            (p.isAtrasado
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300")
                          }
                        >
                          {p.isAtrasado ? "Atrasado" : "Em dia"}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="text-sm text-neutral-600 dark:text-neutral-300 space-y-1 mb-4">
                      <div>
                        <span className="text-neutral-500">Responsável:</span> {responsavel}
                      </div>
                      <div>
                        <span className="text-neutral-500">Início:</span> {new Date(p.dataInicio).toLocaleDateString("pt-BR")}
                      </div>
                      <div>
                        <span className="text-neutral-500">Previsto:</span> {new Date(p.dataFimPrevisto).toLocaleDateString("pt-BR")}
                      </div>
                    </div>

                    {/* Actions (placeholder, desabilitadas) */}
                    <div className="flex gap-2 opacity-60 select-none">
                      <button className="px-3 py-2 rounded-full font-bold text-[13px] bg-fuchsia-900 text-neutral-100 cursor-not-allowed" disabled>
                        Ver mais
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                className="px-3 py-2 rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Anterior
              </button>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Página {page} de {totalPages}
              </span>
              <button
                className="px-3 py-2 rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Próxima
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
