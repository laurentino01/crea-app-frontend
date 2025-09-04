"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import SearchInput from "@/components/SearchInput";
import Card from "@/components/Card";
import ProjectEtapaBadge from "@/components/ProjectEtapaBadge";
import ProjectCriticidadeBadge from "@/components/ProjectCriticidadeBadge";
import ProjectPrazoBadge from "@/components/ProjectPrazoBadge";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import { projectService } from "@/services/LocalStorageProjectService";
import { clientService } from "@/services/LocalStorageClientService";
import { userService } from "@/services/LocalStorageUserService";
import type {
  tProjectPersisted,
  tProjetoEtapa,
  tProjetoCriticidade,
} from "@/@types/tProject";
import { ProjetoEtapa, ProjetoCriticidade } from "@/@types/tProject";

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
  const [allClients, setAllClients] = useState<{ id: string; nome: string }[]>(
    []
  );
  const [allUsers, setAllUsers] = useState<
    { id: string; nome: string; apelido?: string }[]
  >([]);

  // Add project modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [clienteId, setClienteId] = useState<string>("");
  const [dataInicio, setDataInicio] = useState<string>(""); // yyyy-mm-dd
  const [dataFimPrevisto, setDataFimPrevisto] = useState<string>(""); // yyyy-mm-dd
  const [criticidade, setCriticidade] = useState<tProjetoCriticidade>(
    ProjetoCriticidade.Media
  );
  const [selectedEquipe, setSelectedEquipe] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamSearch, setTeamSearch] = useState("");

  useEffect(() => {
    async function loadLookups() {
      const [clients, users] = await Promise.all([
        clientService.findAll(),
        userService.findAll(),
      ]);
      setClientNames(
        Object.fromEntries(clients.map((c) => [c.id, c.nome ?? "—"]))
      );
      setAllClients(clients.map((c) => ({ id: c.id, nome: c.nome })));
      setUserNames(
        Object.fromEntries(
          users.map((u) => [u.id, u.nomeCompleto || u.apelido || "—"])
        )
      );
      setAllUsers(
        users.map((u) => ({
          id: u.id,
          nome: u.nomeCompleto || u.apelido || "—",
          apelido: u.apelido,
        }))
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

  const etapaProgressPct = (e: tProjetoEtapa) => {
    const idx = etapaOptions.findIndex((x) => x.value === e);
    if (idx < 0) return 0;
    const pct = Math.round(((idx + 1) / etapaOptions.length) * 100);
    return Math.max(0, Math.min(100, pct));
  };

  const toggleEquipe = (id: string) => {
    setSelectedEquipe((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredUsers = useMemo(() => {
    const term = teamSearch.trim().toLowerCase();
    if (!term) return allUsers;
    return allUsers.filter((u) => {
      const nome = (u.nome || "").toLowerCase();
      const apelido = (u.apelido || "").toLowerCase();
      return nome.includes(term) || apelido.includes(term);
    });
  }, [allUsers, teamSearch]);

  const handleCreateProject = async (e: any) => {
    e.preventDefault();
    if (saving) return;
    setError(null);

    if (!nome.trim()) {
      setError("Título é obrigatório");
      return;
    }
    if (!clienteId) {
      setError("Selecione um cliente");
      return;
    }
    if (!dataInicio || !dataFimPrevisto) {
      setError("Datas de início e fim previsto são obrigatórias");
      return;
    }

    try {
      setSaving(true);
      const dtInicio = new Date(dataInicio);
      const dtPrev = new Date(dataFimPrevisto);
      const hoje = new Date();
      const isAtrasado =
        dtPrev.getTime() < new Date(hoje.toDateString()).getTime();
      await projectService.create({
        nome: nome.trim(),
        descricao: descricao.trim(),
        urlArquivos: "",
        etapa: ProjetoEtapa.AguardandoArquivos,
        criticidade,
        isAtrasado,
        cliente: clienteId,
        dataInicio: dtInicio,
        dataFimPrevisto: dtPrev,
        historico: [
          {
            titulo: "Projeto criado",
            descricao: "Projeto cadastrado no sistema",
            idProjeto: "", // será ajustado em updates futuros, mantido para consistência do tipo
            data: new Date(),
          },
        ],
        responsavel: Array.from(selectedEquipe)[0] ?? "",
        equipe:
          selectedEquipe.size > 0
            ? Array.from(selectedEquipe).map((u) => ({
                idProjeto: "",
                idUsuario: u,
              }))
            : [],
      });

      // Reset form and reload
      setNome("");
      setDescricao("");
      setClienteId("");
      setDataInicio("");
      setDataFimPrevisto("");
      setCriticidade(ProjetoCriticidade.Media);
      setSelectedEquipe(new Set());
      setIsAddOpen(false);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar projeto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Toolbar */}
      <section className="w-full bg-neutral-50 dark:bg-neutral-900 py-5 px-2 rounded-lg flex flex-col gap-4 md:flex-row md:items-center md:justify-between ">
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

        <div className="flex justify-end">
          <button
            className="flex gap-2 items-center bg-fuchsia-900 rounded-full py-2 px-4 text-neutral-50 cursor-pointer hover:bg-purple-400 active:bg-fuchsia-950"
            onClick={() => {
              setIsAddOpen(true);
              setError(null);
            }}
          >
            <Plus size={20} />
            Adicionar Projeto
          </button>
        </div>
      </section>

      {/* Add Project Modal */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => !saving && setIsAddOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-lg bg-white dark:bg-neutral-900 p-4 sm:p-6 shadow-xl text-neutral-900 dark:text-neutral-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Adicionar Projeto
              </h2>
              <button
                aria-label="Fechar"
                className="p-1 cursor-pointer rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => !saving && setIsAddOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleCreateProject}>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Título <span className="text-fuchsia-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex.: Edição de vídeo institucional"
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Contexto, escopo e observações do projeto"
                    className="w-full min-h-24 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Cliente <span className="text-fuchsia-700">*</span>
                  </label>
                  <select
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                    required
                  >
                    <option value="">Selecionar...</option>
                    {allClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Criticidade
                  </label>
                  <select
                    value={criticidade}
                    onChange={(e) =>
                      setCriticidade(e.target.value as tProjetoCriticidade)
                    }
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  >
                    <option value={ProjetoCriticidade.Baixa}>Baixa</option>
                    <option value={ProjetoCriticidade.Media}>Média</option>
                    <option value={ProjetoCriticidade.Alta}>Alta</option>
                    <option value={ProjetoCriticidade.Urgente}>Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Início <span className="text-fuchsia-700">*</span>
                  </label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Fim previsto <span className="text-fuchsia-700">*</span>
                  </label>
                  <input
                    type="date"
                    value={dataFimPrevisto}
                    onChange={(e) => setDataFimPrevisto(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                    required
                  />
                </div>
              </div>

              {/* Equipe */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3">
                <div className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-2">
                  Equipe
                </div>
                {allUsers.length > 0 && (
                  <div className="mb-2">
                    <SearchInput
                      placeholder="Buscar membros da equipe"
                      value={teamSearch}
                      onChange={setTeamSearch}
                      size="sm"
                    />
                  </div>
                )}
                {allUsers.length === 0 ? (
                  <div className="text-sm text-neutral-500">
                    Nenhum usuário.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-auto pr-1">
                    {filteredUsers.map((u) => {
                      const checked = selectedEquipe.has(u.id);
                      return (
                        <label
                          key={u.id}
                          className="flex items-center gap-2 text-sm cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleEquipe(u.id)}
                            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-fuchsia-700 focus:ring-fuchsia-600"
                          />
                          <span className="inline-flex items-center gap-2">
                            <Avatar name={u.nome} size="sm" />

                            <span className="truncate">{u.nome}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer inline-flex items-center gap-2 bg-fuchsia-900 hover:bg-purple-400 active:bg-fuchsia-950 text-white rounded-md px-4 py-2 disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                const pct = etapaProgressPct(p.etapa);

                return (
                  <Card key={idx}>
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-[18px] text-white ">
                        {<Avatar name={cliente} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold mb-1 truncate">
                          {name}
                        </div>
                        <div className="text-[13px] text-neutral-500 truncate">
                          Cliente: {cliente}
                        </div>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
                      <ProjectEtapaBadge etapa={p.etapa} />
                      <ProjectCriticidadeBadge criticidade={p.criticidade} />
                      {typeof p.isAtrasado === "boolean" && (
                        <ProjectPrazoBadge isAtrasado={p.isAtrasado} />
                      )}
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-fuchsia-600 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-[12px] text-neutral-500 mt-1">
                        Progresso: {pct}%
                      </div>
                    </div>

                    {/* Info */}
                    <div className="text-sm text-neutral-600 dark:text-neutral-300 space-y-1 mb-3">
                      <div>
                        <span className="text-neutral-500">Responsável:</span>{" "}
                        {responsavel}
                      </div>
                      <div>
                        <span className="text-neutral-500">Início:</span>{" "}
                        {new Date(p.dataInicio).toLocaleDateString("pt-BR")}
                      </div>
                      <div>
                        <span className="text-neutral-500">Previsto:</span>{" "}
                        {new Date(p.dataFimPrevisto).toLocaleDateString(
                          "pt-BR"
                        )}
                      </div>
                      {p.descricao && (
                        <div className="text-neutral-500 truncate">
                          {p.descricao}
                        </div>
                      )}
                    </div>

                    {/* Equipe avatars */}
                    {Array.isArray(p.equipe) && p.equipe.length > 0 && (
                      <div className="flex items-center -space-x-2 mb-4">
                        {p.equipe.slice(0, 5).map((m, i) => (
                          <div
                            key={m.idUsuario + i}
                            className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-neutral-900 overflow-hidden bg-neutral-200 flex items-center justify-center"
                            title={userNames[m.idUsuario] || "Usuário"}
                          >
                            <Avatar
                              name={userNames[m.idUsuario] || "Usuário"}
                            />
                          </div>
                        ))}
                        {p.equipe.length > 5 && (
                          <div className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-neutral-900 bg-neutral-300 text-[11px] flex items-center justify-center">
                            +{p.equipe.length - 5}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions (placeholder, desabilitadas) */}
                    <div className="flex gap-2">
                      <Link
                        href={`/projetos/${p.id}`}
                        className="px-3 py-2 rounded-full font-bold text-[13px] bg-fuchsia-900 text-neutral-100 transition-colors duration-200 hover:bg-fuchsia-400 active:bg-fuchsia-950 cursor-pointer"
                      >
                        Detalhes
                      </Link>
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
