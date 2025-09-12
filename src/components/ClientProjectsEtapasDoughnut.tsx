"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { ProjetoEtapa } from "@/@types/tProject";
import { IProjectServices } from "@/interfaces/IProjectServices";
import { projectService } from "@/services/LocalStorageProjectService";
import {
  fetchClientEtapaBreakdown,
  type tEtapaBreakdown,
} from "@/usecases/fetchClientEtapaBreakdown";

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  clientId: string;
  services?: IProjectServices;
  className?: string;
};

function etapaLabel(etapa: ProjetoEtapa): string {
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
    case ProjetoEtapa.Concluido:
      return "Concluído";
    case ProjetoEtapa.Descontinuado:
      return "Descontinuado";
    default:
      return String(etapa);
  }
}

import { ETAPA_COLORS, ETAPA_ORDER as ORDER } from "@/constants/etapaColors";

export default function ClientProjectsEtapasDoughnut({
  clientId,
  services = projectService,
  className,
}: Props) {
  const [data, setData] = useState<tEtapaBreakdown>({ total: 0 });
  const total = data.total ?? 0;

  const load = useCallback(async () => {
    const d = await fetchClientEtapaBreakdown(services, clientId);
    setData(d);
  }, [clientId, services]);

  useEffect(() => {
    load();
  }, [load]);

  // Atualiza quando algum projeto mudar (LocalStorageProjectService emite evento)
  useEffect(() => {
    function onUpdated() {
      load();
    }
    if (typeof window !== "undefined") {
      window.addEventListener("project-updated", onUpdated as EventListener);
      return () =>
        window.removeEventListener("project-updated", onUpdated as EventListener);
    }
  }, [load]);

  const chart = useMemo(() => {
    const labels: string[] = [];
    const values: number[] = [];
    const colors: string[] = [];

    for (const et of ORDER) {
      const v = (data as any)[et] as number | undefined;
      if (v && v > 0) {
        labels.push(etapaLabel(et));
        values.push(v);
        colors.push(ETAPA_COLORS[et]);
      }
    }

    return { labels, values, colors };
  }, [data]);

  const options: ChartOptions<"doughnut"> = useMemo(
    () => ({
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            color: "#6b7280", // neutral-500
            boxWidth: 10,
          },
        },
        tooltip: {
          enabled: true,
        },
      },
      cutout: "65%",
      responsive: true,
      maintainAspectRatio: false,
    }),
    []
  );

  if (total === 0) {
    return (
      <div className={"bg-neutral-100 dark:bg-white/5 p-3 rounded-lg " + (className || "")}>
        <div className="text-[13px] text-neutral-500 mb-1">Projetos</div>
        <div className="font-extrabold text-lg">0</div>
      </div>
    );
  }

  return (
    <div className={"bg-neutral-100 dark:bg-white/5 p-3 rounded-lg " + (className || "")}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-[13px] text-neutral-500">Projetos</div>
          <div className="font-extrabold text-lg">{total}</div>
        </div>
      </div>

      <div className="relative h-40">
        <Doughnut
          options={options}
          data={{
            labels: chart.labels,
            datasets: [
              {
                data: chart.values,
                backgroundColor: chart.colors,
                borderWidth: 0,
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
