"use client";

import { CardSim, Eye, Folder, IdCard, List, Pencil, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import SearchInput from "@/components/SearchInput";
import Card from "@/components/Card";

import Avatar from "@/components/Avatar";
import Link from "next/link";
import { projectService } from "@/services/LocalStorageProjectService";
import { clientService } from "@/services/LocalStorageClientService";
import { userService } from "@/services/LocalStorageUserService";
import ClienteModal from "@/components/ClienteModal";
import ProjetoModal from "@/components/ProjetoModal";
import ProjetoGerenciamentoModal from "@/components/ProjetoGerenciamentoModal";
import type {
  tProjectPersisted,
  tProjetoEtapa,
  tProjetoCriticidade,
} from "@/@types/tProject";
import { ProjetoEtapa, ProjetoCriticidade } from "@/@types/tProject";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { ETAPA_COLORS, ETAPA_ORDER as ORDER } from "@/constants/etapaColors";

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
  const [allCategories, setAllCategories] = useState<string[]>([]);

  // Add project modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isClienteAddOpen, setIsClienteAddOpen] = useState(false);
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

  // Gerenciamento (modal) por cliente
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [manageClientId, setManageClientId] = useState<string | null>(null);

  // (Estados internos do modal movidos para componente)

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
      const cats = Array.from(
        new Set(
          clients
            .map((c) => (c.categoria || "").trim())
            .filter((c) => c && c.length > 0)
        )
      ).sort((a, b) => a.localeCompare(b));
      setAllCategories(cats);
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

  async function reloadClients() {
    const clients = await clientService.findAll();
    setAllClients(clients.map((c) => ({ id: c.id, nome: c.nome })));
    const cats = Array.from(
      new Set(
        clients
          .map((c) => (c.categoria || "").trim())
          .filter((c) => c && c.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b));
    setAllCategories(cats);
  }

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

  // ---- Agrupar por cliente ----
  type tClientGroup = {
    clientId: string;
    clientName: string;
    total: number;
    byEtapa: Partial<Record<tProjetoEtapa, number>>;
  };

  const groups = useMemo<tClientGroup[]>(() => {
    const map = new Map<string, tClientGroup>();
    for (const p of projects) {
      const id = p.cliente;
      const name = clientNames[id] || "—";
      const g = map.get(id) ?? {
        clientId: id,
        clientName: name,
        total: 0,
        byEtapa: {},
      };
      g.total += 1;
      g.byEtapa[p.etapa] = (g.byEtapa[p.etapa] ?? 0) + 1;
      map.set(id, g);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.clientName.localeCompare(b.clientName)
    );
  }, [projects, clientNames]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(groups.length / pageSize));
  }, [groups.length]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return groups.slice(start, start + pageSize);
  }, [groups, page]);

  const etapaProgressPct = (e: tProjetoEtapa) => {
    // Projeto descontinuado deve exibir 0%
    if (e === ProjetoEtapa.Descontinuado) return 0;
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

  // ---- Chart helpers ----
  ChartJS.register(ArcElement, Tooltip, Legend);

  // Colors and order are shared via constants

  const etapaLabel = (et: tProjetoEtapa) => {
    switch (et) {
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
        return String(et);
    }
  };

  const chartOptions: ChartOptions<"doughnut"> = useMemo(
    () => ({
      plugins: {
        legend: {
          display: false, // vamos renderizar legenda custom abaixo com totais
        },
        tooltip: { enabled: true },
      },
      cutout: "65%",
      responsive: true,
      maintainAspectRatio: false,
    }),
    []
  );

  return (
    <>
      <div className="flex justify-between gap-3 mb-4">
        <div className="flex justify-end gap-3 mb-4">
          <button className="shadow rounded-sm p-2 hover:bg-neutral-800 transition-colors cursor-pointer">
            <IdCard />
          </button>
          <button className="shadow rounded-sm p-2 hover:bg-neutral-800 transition-colors cursor-pointer">
            <List />
          </button>
        </div>
        <div className="flex justify-end gap-3 mb-4">
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
          <div className="flex justify-end">
            <button
              className="flex gap-2 items-center bg-fuchsia-900 rounded-full py-2 px-4 text-neutral-50 cursor-pointer hover:bg-purple-400 active:bg-fuchsia-950"
              onClick={() => {
                setIsClienteAddOpen(true);
                setError(null);
              }}
            >
              <Plus size={20} />
              Adicionar Cliente
            </button>
          </div>
        </div>
      </div>
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
      </section>

      {/* Modals */}
      <ProjetoModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        reload={reload}
        allClients={allClients}
        allUsers={allUsers}
      />
      <ClienteModal
        isOpen={isClienteAddOpen}
        onClose={() => setIsClienteAddOpen(false)}
        reload={reloadClients}
        allCategories={allCategories}
        setAllCategories={setAllCategories}
      />

      {/* Lista por cliente */}
      <section className="mt-6">
        {groups.length === 0 ? (
          <div className="text-center text-neutral-600 dark:text-neutral-400 py-16">
            Nenhum projeto encontrado.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pageItems.map((g, idx) => {
                return (
                  <Card
                    key={idx}
                    className="h-[506px] flex flex-col justify-between"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-full flex items-center justify-center font-extrabold text-[18px] text-white ">
                        <Avatar name={g.clientName} size="lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold truncate">
                          {g.clientName}
                        </div>
                        <div className="flex items-center gap-2 text-md font-bold text-neutral-500 truncate  ">
                          <Folder size={22} />
                          {g.total} projetos Ativo{g.total === 1 ? "" : "s"}
                        </div>
                      </div>
                    </div>

                    {/* Doughnut + legenda */}
                    <div className=" mb-4 py-8">
                      <div className="relative h-40">
                        <Doughnut
                          options={chartOptions}
                          data={{
                            labels: ORDER.filter(
                              (et) => (g.byEtapa[et] ?? 0) > 0
                            ).map((et) => etapaLabel(et)),
                            datasets: [
                              {
                                data: ORDER.filter(
                                  (et) => (g.byEtapa[et] ?? 0) > 0
                                ).map((et) => g.byEtapa[et] ?? 0),
                                backgroundColor: ORDER.filter(
                                  (et) => (g.byEtapa[et] ?? 0) > 0
                                ).map((et) => ETAPA_COLORS[et]),
                                borderWidth: 0,
                              },
                            ],
                          }}
                        />
                      </div>

                      {/* Legenda com totais */}
                      <div className="mt-5 grid grid-cols-2 gap-1  text-sm">
                        {ORDER.map((et) => {
                          const val = g.byEtapa[et] ?? 0;
                          if (!val) return null;
                          return (
                            <div key={et} className="flex items-center gap-2 ">
                              <span
                                className="inline-block w-3 h-3 rounded-sm"
                                style={{ backgroundColor: ETAPA_COLORS[et] }}
                              />
                              <span className="text-neutral-600 dark:text-neutral-300">
                                {etapaLabel(et)}:{" "}
                                <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                                  {val}
                                </span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2">
                      <button
                        className="px-3 flex gap-2 items-center py-2 rounded-md font-bold text-sm bg-fuchsia-900 text-neutral-100 transition-colors duration-200 hover:bg-fuchsia-400 active:bg-fuchsia-950 cursor-pointer"
                        onClick={() => {
                          setManageClientId(g.clientId);
                          setIsManageOpen(true);
                        }}
                      >
                        <Eye size={22} /> Ver Detalhes
                      </button>
                      <Link
                        href={`/clientes/${g.clientId}`}
                        className="px-3 flex gap-2 items-center py-2 rounded-md font-bold text-sm shadow dark:hover:bg-neutral-800 hover:bg-neutral-300  text-neutral-100 transition-colors duration-200 cursor-pointer"
                      >
                        <Pencil size={22} />
                        Editar
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

      {/* modal gerenciamento de projeto (componentizado) */}
      <ProjetoGerenciamentoModal
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        clientId={manageClientId}
        clientName={manageClientId ? clientNames[manageClientId] : undefined}
      />
    </>
  );
}
