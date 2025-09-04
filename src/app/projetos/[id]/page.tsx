"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { projectService } from "@/services/LocalStorageProjectService";
import { clientService } from "@/services/LocalStorageClientService";
import type { tProjectPersisted } from "@/@types/tProject";
import { updateProject } from "@/usecases/updateProject";

type ClientOption = { id: string; nome: string };

export default function ProjetoDetalhesPage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id as string | undefined;

  const [project, setProject] = useState<tProjectPersisted | null>(null);
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

  useEffect(() => {
    async function load() {
      try {
        if (!projectId) return;
        const [proj, cls] = await Promise.all([
          projectService.findById(projectId),
          clientService.findAll(),
        ]);
        setClients(cls.map((c) => ({ id: c.id, nome: c.nome })));
        if (!proj) {
          setError("Projeto não encontrado");
          return;
        }
        setProject(proj);
        // hydrate form
        setForm({
          nome: proj.nome ?? "",
          clienteId: proj.cliente ?? "",
          descricao: proj.descricao ?? "",
          dataInicio: formatDateInput(proj.dataInicio),
          dataFimPrevisto: formatDateInput(proj.dataFimPrevisto),
          dataFimReal: formatDateInput(proj.dataFimReal),
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  // Progresso do projeto agora é calculado no Layout

  

  function formatDateInput(d?: Date): string {
    if (!d) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function parseDateOrNull(s: string): Date | undefined {
    if (!s) return undefined;
    const d = new Date(s);
    return isNaN(d.getTime()) ? undefined : d;
  }

  async function handleSave() {
    if (!project) return;
    setError(null);
    setSaveMsg(null);

    const { nome, clienteId, dataInicio, dataFimPrevisto, dataFimReal } = form;
    if (!nome.trim()) {
      setError("Nome do projeto é obrigatório");
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
      const dtInicio = parseDateOrNull(dataInicio)!;
      const dtPrev = parseDateOrNull(dataFimPrevisto)!;
      const dtReal = parseDateOrNull(dataFimReal);

      const hoje = new Date();
      const hojeMid = new Date(hoje.toDateString());
      const isAtrasado = dtPrev.getTime() < hojeMid.getTime();

      const updated = await updateProject(projectService, project.id, {
        nome: nome.trim(),
        cliente: clienteId,
        descricao: form.descricao.trim(),
        dataInicio: dtInicio,
        dataFimPrevisto: dtPrev,
        dataFimReal: dtReal,
        isAtrasado,
      });
      setProject(updated);
      setEditing(false);
      setSaveMsg("Alterações salvas com sucesso.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar as alterações."
      );
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="space-y-4">
      {/* Informações */}
      <section
        id="informacoes"
        className="rounded-lg dark:bg-neutral-900 bg-neutral-100 p-4"
      >
        <div className="flex items-center mb-4">
          <h2 className="text-base font-semibold">Informações do Projeto</h2>
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
                    onClick={handleSave}
                  >
                    {saving ? "Salvando…" : "Salvar"}
                  </button>
                  <button
                    className="px-3 py-1.5 text-sm rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                    disabled={saving}
                    onClick={() => {
                      if (project) {
                        setForm({
                          nome: project.nome ?? "",
                          clienteId: project.cliente ?? "",
                          descricao: project.descricao ?? "",
                          dataInicio: formatDateInput(project.dataInicio),
                          dataFimPrevisto: formatDateInput(
                            project.dataFimPrevisto
                          ),
                          dataFimReal: formatDateInput(project.dataFimReal),
                        });
                      }
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

        {saveMsg && (
          <div className="text-green-700 dark:text-green-400 text-sm">
            {saveMsg}
          </div>
        )}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 mb-2">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Nome do projeto
            </label>
            <input
              type="text"
              value={form.nome}
              disabled={!editing}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <select
              value={form.clienteId}
              disabled={!editing}
              onChange={(e) =>
                setForm((f) => ({ ...f, clienteId: e.target.value }))
              }
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
            >
              <option value="">Selecione...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Início</label>
            <input
              type="date"
              value={form.dataInicio}
              disabled={!editing}
              onChange={(e) =>
                setForm((f) => ({ ...f, dataInicio: e.target.value }))
              }
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Fim previsto
            </label>
            <input
              type="date"
              value={form.dataFimPrevisto}
              disabled={!editing}
              onChange={(e) =>
                setForm((f) => ({ ...f, dataFimPrevisto: e.target.value }))
              }
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fim real</label>
            <input
              type="date"
              value={form.dataFimReal}
              disabled={!editing}
              onChange={(e) =>
                setForm((f) => ({ ...f, dataFimReal: e.target.value }))
              }
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={form.descricao}
              disabled={!editing}
              onChange={(e) =>
                setForm((f) => ({ ...f, descricao: e.target.value }))
              }
              rows={4}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
            />
          </div>
        </div>
      </section>

      
    </div>
  );
}
