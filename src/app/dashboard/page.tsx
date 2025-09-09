import Card from "@/components/Card";
import ProgressBar from "@/components/ProgressBar";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarCheck,
  CirclePause,
  Clock2,
  ConciergeBell,
  TriangleAlert,
} from "lucide-react";

export default function Dashboard() {
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
      <section className="mt-5 w-full px-4 py-7 bg-neutral-100 dark:bg-neutral-900 rounded-xl flex justify-between items-center border-l-3 border-orange-600 flex-col gap-10">
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
    </>
  );
}
