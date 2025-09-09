"use client";

import Card from "@/components/Card";
import ProgressBar from "@/components/ProgressBar";
import SearchInput from "@/components/SearchInput";
import ProjectPrazoBadge from "@/components/ProjectPrazoBadge";
import { projectService } from "@/services/LocalStorageProjectService";
import { clientService } from "@/services/LocalStorageClientService";
import { userService } from "@/services/LocalStorageUserService";
import type {
  tProjectPersisted,
  tProjetoEtapa,
  tProjetoEtapaItem,
} from "@/@types/tProject";
import { ProjetoEtapa, ProjetoEtapaStatus } from "@/@types/tProject";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarCheck,
  CirclePause,
  Clock2,
  ConciergeBell,
  Folder,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type StatusFilter = "all" | "late" | "on_time";
type ProgressoFilter = "all" | "p0_25" | "p26_50" | "p51_75" | "p76_99";
type EtapaFilter = "all" | tProjetoEtapa;

const etapaOptions: { value: tProjetoEtapa; label: string }[] = [
  { value: ProjetoEtapa.AguardandoArquivos, label: "Aguardando arquivos" },
  { value: ProjetoEtapa.Decupagem, label: "Decupagem" },
  { value: ProjetoEtapa.Revisao, label: "Revisão" },
  { value: ProjetoEtapa.Sonorizacao, label: "Sonorização" },
  { value: ProjetoEtapa.PosProducao, label: "Pós-produção" },
  { value: ProjetoEtapa.Analise, label: "Análise" },
  // Concluído e Descontinuado intencionalmente fora do filtro de etapa
];

// Progresso baseado no status por etapa
function etapasProgressPct(etapas: tProjetoEtapaItem[] | undefined): number {
  if (!etapas || etapas.length === 0) return 0;
  const allDescont = etapas.every(
    (e) => e.status === ProjetoEtapaStatus.Descontinuado
  );
  if (allDescont) return 0;
  const valid = etapas.filter(
    (e) => e.status !== ProjetoEtapaStatus.Descontinuado
  );
  if (valid.length === 0) return 0;
  const done = valid.filter(
    (e) => e.status === ProjetoEtapaStatus.Concluido
  ).length;
  return Math.round((done / valid.length) * 100);
}

export default function Dashboard() {
  // ===== Projetos ativos (tabela nova) =====
  const [projects, setProjects] = useState<tProjectPersisted[]>([]);
  const [etapasMap, setEtapasMap] = useState<
    Record<string, tProjetoEtapaItem[]>
  >({});
  const [clientNames, setClientNames] = useState<Record<string, string>>({});
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  const [search, setSearch] = useState("");
  const [etapaFilter, setEtapaFilter] = useState<EtapaFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [progFilter, setProgFilter] = useState<ProgressoFilter>("all");
  const [dateFrom, setDateFrom] = useState<string>(""); // yyyy-mm-dd
  const [dateTo, setDateTo] = useState<string>(""); // yyyy-mm-dd

  // Lookups
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

  async function reloadProjects() {
    const all = await projectService.findAll();
    // Somente projetos que não estão concluídos ou descontinuados
    const active = all.filter(
      (p) =>
        p.etapa !== ProjetoEtapa.Concluido &&
        p.etapa !== ProjetoEtapa.Descontinuado
    );
    setProjects(active);

    // Carrega etapas de cada projeto para obter responsável da etapa e progresso
    const entries = await Promise.all(
      active.map(async (p) => {
        const etps = await projectService.getEtapas(p.id);
        return [p.id, etps] as const;
      })
    );
    setEtapasMap(Object.fromEntries(entries));
  }

  useEffect(() => {
    reloadProjects();
    // atualiza ao receber evento de mudança
    function onUpdated() {
      reloadProjects();
    }
    if (typeof window !== "undefined") {
      window.addEventListener("project-updated", onUpdated as any);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("project-updated", onUpdated as any);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();

    const toDate = (s: string) => (s ? new Date(s) : null);
    const fromDt = toDate(dateFrom);
    const toDt = toDate(dateTo);

    const inProgRange = (pct: number) => {
      switch (progFilter) {
        case "p0_25":
          return pct >= 0 && pct <= 25;
        case "p26_50":
          return pct >= 26 && pct <= 50;
        case "p51_75":
          return pct >= 51 && pct <= 75;
        case "p76_99":
          return pct >= 76 && pct <= 99;
        default:
          return true;
      }
    };

    const etapaLabel = (e: tProjetoEtapa) =>
      etapaOptions.find((x) => x.value === e)?.label ?? String(e);

    return projects
      .map((p) => {
        const etps = etapasMap[p.id] ?? [];
        const progress = etapasProgressPct(etps);
        const currentEtapa = p.etapa;
        const etapaInfo = etps.find((e) => e.etapa === currentEtapa);
        const etapaRespId = etapaInfo?.responsavel || p.responsavel || "";
        const membro = userNames[etapaRespId] || "—";
        const cliente = clientNames[p.cliente] || "—";
        const statusLate = !!p.isAtrasado;

        return {
          id: p.id,
          projeto: p.nome,
          cliente,
          membro,
          etapa: etapaLabel(currentEtapa),
          etapaValue: currentEtapa,
          progresso: progress,
          isAtrasado: statusLate,
          dataInicio: new Date(p.dataInicio),
          dataPrev: new Date(p.dataFimPrevisto),
        };
      })
      .filter((r) => {
        // etapa
        if (etapaFilter !== "all" && r.etapaValue !== etapaFilter) return false;
        // status
        if (
          statusFilter !== "all" &&
          ((statusFilter === "late" && !r.isAtrasado) ||
            (statusFilter === "on_time" && r.isAtrasado))
        )
          return false;
        // progresso
        if (!inProgRange(r.progresso)) return false;
        // data previsao (range)
        if (fromDt && r.dataPrev < fromDt) return false;
        if (toDt && r.dataPrev > toDt) return false;
        // search (membro, cliente, projeto)
        if (term) {
          const p = r.projeto.toLowerCase();
          const c = r.cliente.toLowerCase();
          const m = r.membro.toLowerCase();
          if (!p.includes(term) && !c.includes(term) && !m.includes(term))
            return false;
        }
        return true;
      })
      .sort((a, b) => a.dataPrev.getTime() - b.dataPrev.getTime());
  }, [
    projects,
    etapasMap,
    userNames,
    clientNames,
    search,
    etapaFilter,
    statusFilter,
    progFilter,
    dateFrom,
    dateTo,
  ]);

  // Mock simples para amostrar a tabela (não busca do storage)
  const mockTasks: Array<{
    id: string;
    projeto: string;
    etapa: string;
    progresso: number; // 0..100
    inicioEtapa: string; // texto pronto (já formatado)
    fimPrevistoProjeto: string; // texto pronto
  }> = [
    {
      id: "t1",
      projeto:
        "Campanha institucional — Vídeo teaser para MidiaMax com entregáveis multiplataforma",
      etapa: "Revisão",
      progresso: 35,
      inicioEtapa: "10/08/2025 14:20",
      fimPrevistoProjeto: "28/08/2025",
    },
    {
      id: "t2",
      projeto: "Tutorial App Crea — Onboarding",
      etapa: "Decupagem",
      progresso: 55,
      inicioEtapa: "09/08/2025 10:05",
      fimPrevistoProjeto: "22/08/2025",
    },
    {
      id: "t3",
      projeto: "Institucional ACME: Pós-produção V2 (legenda + correções)",
      etapa: "Pós-produção",
      progresso: 80,
      inicioEtapa: "05/08/2025 09:00",
      fimPrevistoProjeto: "18/08/2025",
    },
    {
      id: "t4",
      projeto: "Série Reels Cliente Z — Episódio 03",
      etapa: "Sonorização",
      progresso: 20,
      inicioEtapa: "11/08/2025 16:40",
      fimPrevistoProjeto: "30/08/2025",
    },
    {
      id: "t5",
      projeto: "Documentário FeiraTech — Corte final e QC",
      etapa: "Análise",
      progresso: 10,
      inicioEtapa: "12/08/2025 11:10",
      fimPrevistoProjeto: "02/09/2025",
    },
    {
      id: "t6",
      projeto: "Cliente Orion — Kit de vinhetas (pacote 12x)",
      etapa: "Aguardando arquivos",
      progresso: 0,
      inicioEtapa: "—",
      fimPrevistoProjeto: "12/09/2025",
    },
    {
      id: "t7",
      projeto: "Marca X — Guia de uso audiovisual (cutdowns)",
      etapa: "Revisão",
      progresso: 65,
      inicioEtapa: "07/08/2025 15:25",
      fimPrevistoProjeto: "25/08/2025",
    },
    {
      id: "t8",
      projeto: "Série Institucional Y — Episódio 06 (edição e SFX)",
      etapa: "Decupagem",
      progresso: 45,
      inicioEtapa: "08/08/2025 13:00",
      fimPrevistoProjeto: "27/08/2025",
    },
  ];

  return (
    <>
      {/* Indicadores principais */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        <Card className="w-full border-t-3 border-fuchsia-900">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-medium">
              Projetos Atrasados
            </h3>
            <TriangleAlert className="text-red-800" size={22} />
          </div>
          <span className="block mt-2 text-3xl font-semibold tracking-tight">
            0
          </span>
        </Card>
        <Card className="w-full border-t-3 border-cyan-600">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-medium">
              Projetos no prazo
            </h3>
            <BadgeCheck className="text-green-500" size={22} />
          </div>
          <span className="block mt-2 text-3xl font-semibold tracking-tight">
            0
          </span>
        </Card>
        <Card className="w-full border-t-3 border-orange-500">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-medium">
              Membros Ociosos
            </h3>
            <CirclePause className="text-red-800" size={22} />
          </div>
          <span className="block mt-2 text-3xl font-semibold tracking-tight">
            0
          </span>
        </Card>
        <Card className="w-full border-t-3 border-green-600">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-medium">
              Membros Atuando
            </h3>
            <BriefcaseBusiness className="text-green-500" size={22} />
          </div>
          <span className="block mt-2 text-3xl font-semibold tracking-tight">
            0
          </span>
        </Card>
      </section>

      {/* Minhas tarefas */}
      <section className="w-full dark:bg-neutral-900 bg-neutral-100 p-5 rounded-xl ">
        <div className=" flex items-end justify-between mb-3">
          <div className="flex w-full justify-between items-center">
            <div className="flex gap-2 items-center">
              <CalendarCheck size={22} />
              <h2 className="text-lg font-semibold">Minhas tarefas</h2>
            </div>
            <p className="text-md text-neutral-500 dark:text-neutral-400">
              Acompanhe suas etapas ativas e prazos.
            </p>
          </div>
        </div>

        {/* Área scrollável para não ocupar muita altura */}

        <div className="max-h-100 overflow-y-auto rounded-lg ">
          <table className="min-w-[760px] w-full text-sm border-collapse">
            <thead className="">
              <tr className="text-left text-neutral-600 dark:text-neutral-300">
                <th className="font-medium py-2 px-3 border-b border-neutral-200 dark:border-neutral-800">
                  Projeto
                </th>
                <th className="font-medium py-2 px-3 border-b border-neutral-200 dark:border-neutral-800">
                  Etapa
                </th>
                <th className="font-medium py-2 px-3 border-b border-neutral-200 dark:border-neutral-800">
                  Progresso
                </th>
                <th className="font-medium py-2 px-3 border-b border-neutral-200 dark:border-neutral-800">
                  Início da etapa
                </th>
                <th className="font-medium py-2 px-3 border-b border-neutral-200 dark:border-neutral-800">
                  Fim previsto do projeto
                </th>
              </tr>
            </thead>
            <tbody>
              {mockTasks.map((t) => (
                <tr
                  key={t.id}
                  className="cursor-pointer transition-all duration-200 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 hover:shadow-md hover:scale-[1.01]"
                >
                  <td className="py-3 px-3 align-middle">
                    <div className="max-w-[340px] truncate" title={t.projeto}>
                      {t.projeto}
                    </div>
                  </td>
                  <td className="py-3 px-3 align-middle text-neutral-800 dark:text-neutral-200">
                    {t.etapa}
                  </td>
                  <td className="py-3 px-3 align-middle w-[180px]">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={t.progresso} size="md" />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400 w-10 text-right">
                        {t.progresso}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 align-middle text-neutral-700 dark:text-neutral-300">
                    <span className="whitespace-nowrap">{t.inicioEtapa}</span>
                  </td>
                  <td className="py-3 px-3 align-middle text-neutral-700 dark:text-neutral-300">
                    <span className="whitespace-nowrap">
                      {t.fimPrevistoProjeto}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="mt-10 w-full px-4 py-7 bg-neutral-100 dark:bg-neutral-900 rounded-xl flex justify-between items-center border-l-3 border-orange-600 flex-col gap-10">
        <div className="flex w-full justify-between items-center">
          <div className="flex gap-2 items-center">
            <Clock2 size={22} />
            <div>
              <h2 className="text-lg font-semibold">Flowtime</h2>
              <p className="text-md text-neutral-500 dark:text-neutral-400">
                Registre seu tempo de trabalho.
              </p>
            </div>
          </div>

          <button className="bg-orange-600 rounded-md px-4 py-2  cursor-pointer hover:bg-amber-400 transition-colors active:bg-orange-600 flex gap-2 justify-between items-center">
            <ConciergeBell size={20} />
            <span className="text-lg"> Checkin</span>
          </button>
        </div>
      </section>
      {/* Projetos ativos (lista) */}
      <section className="w-full bg-neutral-50 dark:bg-neutral-900 py-5 px-2 rounded-lg flex flex-col gap-4 md:items-center md:justify-between mb-3 mt-10">
        <div className="w-full md:max-w-4xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <SearchInput
            placeholder="Buscar por membro, cliente ou projeto"
            value={search}
            onChange={setSearch}
            size="md"
            className="flex-1 py-2 w-full"
          />
          <div className="flex items-center gap-2">
            <select
              value={etapaFilter}
              onChange={(e) =>
                setEtapaFilter((e.target.value as EtapaFilter) ?? "all")
              }
              className="cursor-pointer rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-2 text-sm"
            >
              <option value="all">Total Etapas</option>
              {etapaOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={progFilter}
              onChange={(e) => setProgFilter(e.target.value as ProgressoFilter)}
              className="cursor-pointer rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-2 text-sm"
            >
              <option value="all">Total Progresso</option>
              <option value="p0_25">0–25%</option>
              <option value="p26_50">26–50%</option>
              <option value="p51_75">51–75%</option>
              <option value="p76_99">76–99%</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="cursor-pointer rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-2 text-sm"
            >
              <option value="all">Total Status</option>
              <option value="on_time">No prazo</option>
              <option value="late">Atrasado</option>
            </select>
          </div>
        </div>
      </section>

      <section className="w-full dark:bg-neutral-900 bg-neutral-100 p-5 rounded-xl mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2 items-center">
            <Folder size={22} />
            <h2 className="text-lg font-semibold">Alocação de equipe</h2>
          </div>
          <p className="text-md text-neutral-500 dark:text-neutral-400">
            Filtre por etapa, progresso, status e data.
          </p>
        </div>

        <div className="max-h-100 overflow-y-auto rounded-lg">
          <table className="min-w-[960px] w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-neutral-600 dark:text-neutral-300">
                <th className="font-medium py-2 px-3 border-b border-neutral-200 dark:border-neutral-800">
                  Membro
                </th>
                <th className="font-medium py-2 px-3 border-b border-neutral-200 dark:border-neutral-800">
                  Projeto
                </th>
                <th className="font-medium py-2 px-3 border-b border-neutral-200 dark:border-neutral-800">
                  Cliente
                </th>
                <th className="font-medium py-2 px-3 border-b border-neutral-200 dark:border-neutral-800">
                  Etapa
                </th>
                <th className="font-medium py-2 px-3 border-b border-neutral-200 dark:border-neutral-800">
                  Progresso
                </th>
                <th className="font-medium py-2 px-3 border-b border-neutral-200 dark:border-neutral-800">
                  Status
                </th>
                <th className="font-medium py-2 px-3 border-b border-neutral-200 dark:border-neutral-800">
                  Início
                </th>
                <th className="font-medium py-2 px-3 border-b border-neutral-200 dark:border-neutral-800">
                  Previsto
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer transition-all duration-200 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 hover:shadow-md hover:scale-[1.01]"
                >
                  <td className="py-3 px-3 align-middle text-neutral-800 dark:text-neutral-200 max-w-[200px] truncate">
                    {r.membro}
                  </td>
                  <td className="py-3 px-3 align-middle">
                    <div className="max-w-[340px] truncate" title={r.projeto}>
                      {r.projeto}
                    </div>
                  </td>
                  <td className="py-3 px-3 align-middle text-neutral-700 dark:text-neutral-300">
                    {r.cliente}
                  </td>
                  <td className="py-3 px-3 align-middle text-neutral-800 dark:text-neutral-200">
                    {r.etapa}
                  </td>
                  <td className="py-3 px-3 align-middle w-[200px]">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={r.progresso} size="md" />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400 w-10 text-right">
                        {r.progresso}%
                      </span>
                    </div>
                  </td>
                  <td className=" align-middle">
                    <ProjectPrazoBadge isAtrasado={r.isAtrasado} />
                  </td>
                  <td className="py-3 px-3 align-middle text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                    {r.dataInicio.toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-3 px-3 align-middle text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                    {r.dataPrev.toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-6 px-3 text-center text-neutral-600 dark:text-neutral-400"
                  >
                    Nenhum projeto ativo encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
