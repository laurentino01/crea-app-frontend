"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { projectService } from "@/services/api/ProjetoService";
import type { tProject } from "@/@types/tProject";
import { findById } from "@/usecases/projetoCases";
import { formataData } from "@/utils/formataData";

type ClientOption = { id: string; nome: string };

export default function ProjetoDetalhesPage() {
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<tProject | null>(null);
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [dataFinalizado, setDataFinalizado] = useState<string>("");
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Editable fields (Informações)
  const [form, setForm] = useState({
    nome: "",
    clienteId: "",
    descricao: "",
    dataInicio: "", // yyyy-MM-dd
    dataFimPrevisto: "",
    dataFimReal: "",
  });

  async function findProjetoInfos() {
    const res = await findById(projectService, Number(id));
    if (res) {
      setProject(res);
      setDataInicio(formataData(res.dataInicio));
      setDataFim(formataData(res.dataFim));
      setDataFinalizado(formataData(res.dataFinalizado));
    }
  }

  useEffect(() => {
    findProjetoInfos();
  }, []);

  return (
    <div className="space-y-4">
      {/* Informações */}

      <div className="flex items-center mb-4">
        {!loading && !error && project && (
          <div className="ml-auto flex items-center gap-2">
            {!editing ? (
              <button
                className="px-3 py-1.5 text-sm rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                onClick={() => {
                  setSaveMsg(null);
                  setEditing(true);
                }}
              >
                Editar
              </button>
            ) : (
              <>
                <button
                  className="px-3 py-1.5 text-sm rounded-md bg-fuchsia-900 text-white hover:bg-fuchsia-700 disabled:opacity-50 cursor-pointer"
                  disabled={saving}
                >
                  {saving ? "Salvando…" : "Salvar"}
                </button>
                <button
                  className="px-3 py-1.5 text-sm rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                  disabled={saving}
                  onClick={() => {
                    setEditing(false);
                    setSaveMsg(null);
                  }}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Nome do projeto
          </label>
          <input
            type="text"
            defaultValue={project?.nome}
            disabled={!editing}
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cliente</label>
          <input
            type="text"
            defaultValue={project?.cliente.nome}
            disabled={true}
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Início</label>
          <input
            type="text"
            defaultValue={dataInicio}
            disabled={!editing}
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fim previsto</label>
          <input
            type="text"
            defaultValue={dataFim}
            disabled={true}
            onChange={(e) =>
              setForm((f) => ({ ...f, dataFimPrevisto: e.target.value }))
            }
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fim real</label>
          <input
            type="text"
            defaultValue={dataFinalizado}
            disabled={true}
            onChange={(e) =>
              setForm((f) => ({ ...f, dataFimReal: e.target.value }))
            }
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            value={project?.descricao}
            disabled={!editing}
            rows={4}
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
          />
        </div>
      </div>
    </div>
  );
}
