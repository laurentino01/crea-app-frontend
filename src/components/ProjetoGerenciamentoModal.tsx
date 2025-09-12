"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Folder } from "lucide-react";
import SearchInput from "@/components/SearchInput";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import ProjectEtapaBadge from "@/components/ProjectEtapaBadge";
import ProjectPrazoBadge from "@/components/ProjectPrazoBadge";
import { projectService } from "@/services/LocalStorageProjectService";
import type { tProjectPersisted, tProjetoEtapa } from "@/@types/tProject";
import { ProjetoEtapa } from "@/@types/tProject";
import { ETAPA_COLORS } from "@/constants/etapaColors";

type AtrasoFilter = "all" | "late" | "on_time";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  clientId: string | null;
  clientName?: string;
};

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

export default function ProjetoGerenciamentoModal({
  isOpen,
  onClose,
  clientId,
  clientName,
}: Props) {
  const [allProjects, setAllProjects] = useState<tProjectPersisted[]>([]);
  const [search, setSearch] = useState("");
  const [etapa, setEtapa] = useState<"all" | tProjetoEtapa>("all");
  const [prazo, setPrazo] = useState<AtrasoFilter>("all");
  const [status, setStatus] = useState<
    "all" | "em_andamento" | "concluido" | "descontinuado"
  >("all");
  const [startFrom, setStartFrom] = useState<string>("");
  const [startTo, setStartTo] = useState<string>("");
  const [endFrom, setEndFrom] = useState<string>("");
  const [endTo, setEndTo] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      const list = await projectService.findAll();
      setAllProjects(list);
    })();
  }, [isOpen]);

  const clientProjects = useMemo(() => {
    const cid = clientId ?? "";
    return allProjects.filter((p) => p.cliente === cid);
  }, [allProjects, clientId]);

  const filtered = useMemo(() => {
    const parse = (s: string) => (s ? new Date(s + "T00:00:00") : null);
    const sFrom = parse(startFrom);
    const sTo = parse(startTo);
    const eFrom = parse(endFrom);
    const eTo = parse(endTo);
    const term = search.trim().toLowerCase();

    return clientProjects.filter((p) => {
      if (term) {
        const n = (p.nome || "").toLowerCase();
        if (!n.includes(term)) return false;
      }
      if (etapa !== "all" && p.etapa !== etapa) return false;
      if (prazo !== "all") {
        const wantLate = prazo === "late";
        if ((p.isAtrasado ?? false) !== wantLate) return false;
      }
      if (status !== "all") {
        const st =
          p.etapa === ProjetoEtapa.Concluido
            ? "concluido"
            : p.etapa === ProjetoEtapa.Descontinuado
            ? "descontinuado"
            : "em_andamento";
        if (st !== status) return false;
      }
      const dInicio = p.dataInicio ? new Date(p.dataInicio) : undefined;
      const dFimPrev = p.dataFimPrevisto
        ? new Date(p.dataFimPrevisto)
        : undefined;
      if (sFrom && dInicio && dInicio < sFrom) return false;
      if (sTo && dInicio && dInicio > sTo) return false;
      if (eFrom && dFimPrev && dFimPrev < eFrom) return false;
      if (eTo && dFimPrev && dFimPrev > eTo) return false;
      return true;
    });
  }, [
    clientProjects,
    search,
    etapa,
    prazo,
    status,
    startFrom,
    startTo,
    endFrom,
    endTo,
  ]);

  if (!isOpen) return null;

  return (
    <section
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 "
      onClick={onClose}
    >
      <div
        className="min-h-[90vh] w-full max-w-5xl rounded-lg bg-white dark:bg-neutral-900 p-4 sm:p-6 shadow-xl text-neutral-900 dark:text-neutral-100 max-h-[90vh] min-w-[70vw] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full flex items-center justify-center font-extrabold  text-white ">
              <Avatar name={clientName || "—"} size="xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold truncate">{clientName || "—"}</div>
              <div className="flex items-center gap-2 text-md font-bold text-neutral-500 truncate">
                <Folder size={22} />
                {clientProjects.length} projetos
              </div>
            </div>
          </div>
          <button
            aria-label="Fechar"
            className="p-1 cursor-pointer rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Filtros */}
        <div className="flex justify-between items-end mb-10">
          {/* Filtros: Prazo e Previsão (data fim prevista) */}
          <div className="flex gap-5">
            <label htmlFor="prazo">
              Prazo
              <select
                value={prazo}
                id="prazo"
                onChange={(e) => setPrazo(e.target.value as AtrasoFilter)}
                className="cursor-pointer rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-2 text-sm"
              >
                <option value="all">Prazo</option>
                <option value="late">Atrasados</option>
                <option value="on_time">Em dia</option>
              </select>
            </label>

            <label className="">
              Previsão
              <input
                type="date"
                value={endFrom}
                onChange={(e) => {
                  const v = e.target.value;
                  setEndFrom(v);
                  setEndTo(v);
                }}
                className="cursor-pointer rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-2 text-sm"
              />
            </label>
          </div>

          {/* Filtros por Etapa */}
          <div className="w-full justify-end flex">
            {(
              [
                ProjetoEtapa.AguardandoArquivos,
                ProjetoEtapa.Decupagem,
                ProjetoEtapa.Revisao,
                ProjetoEtapa.Sonorizacao,
                ProjetoEtapa.PosProducao,
                ProjetoEtapa.Analise,
                ProjetoEtapa.Concluido,
              ] as tProjetoEtapa[]
            ).map((et) => {
              const isActive = etapa === et;
              const label = (() => {
                switch (et) {
                  case ProjetoEtapa.AguardandoArquivos:
                    return "Aguardando Arquivos";
                  case ProjetoEtapa.Decupagem:
                    return "Decupagem";
                  case ProjetoEtapa.Revisao:
                    return "Revisão";
                  case ProjetoEtapa.Sonorizacao:
                    return "Sonorização";
                  case ProjetoEtapa.PosProducao:
                    return "Pós-Produção";
                  case ProjetoEtapa.Analise:
                    return "Análise";
                  case ProjetoEtapa.Concluido:
                    return "Concluído";
                  default:
                    return String(et);
                }
              })();
              return (
                <button
                  key={et}
                  className={
                    "text-sm rounded-full px-3 py-2 cursor-pointer transition-colors" +
                    (isActive
                      ? " text-white"
                      : "  text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700")
                  }
                  style={isActive ? { backgroundColor: ETAPA_COLORS[et] } : {}}
                  onClick={() => setEtapa((prev) => (prev === et ? "all" : et))}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de projetos */}
        {filtered.length === 0 ? (
          <div className="text-center text-neutral-600 dark:text-neutral-400 py-10">
            Nenhum projeto encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((p) => (
              <Link
                key={p.id}
                href={`/projetos/${p.id}`}
                className="block rounded-lg  shadow p-3 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="font-semibold mb-2 truncate">{p.nome}</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <ProjectEtapaBadge etapa={p.etapa} />
                  <ProjectPrazoBadge isAtrasado={!!p.isAtrasado} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
