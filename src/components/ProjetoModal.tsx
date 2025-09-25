"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import SearchInput from "@/components/SearchInput";
import Avatar from "@/components/Avatar";
import { projectService } from "@/services/LocalStorageProjectService";
import type { tProjetoCriticidade } from "@/@types/tProject";
import { ProjetoEtapa, ProjetoCriticidade } from "@/@types/tProject";
import { tUser } from "@/@types/tUser";
import { fetchUsers } from "@/usecases/userCases";
import { userService } from "@/services/api/UserServices";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  reload: () => Promise<void> | void;
  allClients: { id: string; nome: string }[];
};

export default function ProjetoModal({
  isOpen,
  onClose,
  reload,
  allClients,
}: Props) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [allUsers, setAllUsers] = useState<tUser[]>([]);
  const [clienteId, setClienteId] = useState<string>("");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFimPrevisto, setDataFimPrevisto] = useState<string>("");
  const [criticidade, setCriticidade] = useState<tProjetoCriticidade>(
    ProjetoCriticidade.Media
  );
  const [selectedEquipe, setSelectedEquipe] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamSearch, setTeamSearch] = useState("");

  const toggleEquipe = (id: number) => {
    setSelectedEquipe((prev) => {
      const next = new Set(prev);
      if (next.has(String(id))) next.delete(String(id));
      else next.add(String(id));
      return next;
    });
  };

  const filteredUsers = useMemo(() => {
    const term = teamSearch.trim().toLowerCase();
    if (!term) return allUsers;
    return allUsers.filter((u) => {
      const nome = (u.apelido || "").toLowerCase();
      const apelido = (u.apelido || "").toLowerCase();
      return nome.includes(term) || apelido.includes(term);
    });
  }, [allUsers, teamSearch]);

  async function fetchAll() {
    const res = await fetchUsers(userService);
    return res;
  }

  useEffect(() => {
    fetchAll().then((data) => {
      setAllUsers(data);
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      onClick={() => !saving && onClose()}
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
            onClick={() => !saving && onClose()}
          >
            <X size={18} />
          </button>
        </div>

        <form
          className="space-y-4"
          onSubmit={async (e) => {
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
                    idProjeto: "",
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

              setNome("");
              setDescricao("");
              setClienteId("");
              setDataInicio("");
              setDataFimPrevisto("");
              setCriticidade(ProjetoCriticidade.Media);
              setSelectedEquipe(new Set());
              onClose();
              await reload();
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Erro ao salvar projeto"
              );
            } finally {
              setSaving(false);
            }
          }}
        >
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
                Link Arquivos<span className="text-fuchsia-700">*</span>
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: https://drive.google/..."
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
                {/* <SearchInput
                  placeholder="Buscar membros da equipe"
                  value={teamSearch}
                  onChange={setTeamSearch}
                  size="sm"
                /> */}
              </div>
            )}
            {allUsers.length === 0 ? (
              <div className="text-sm text-neutral-500">Nenhum usuário.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-auto pr-1">
                {filteredUsers.map((u) => {
                  const checked = selectedEquipe.has(String(u.id));
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
                        <Avatar name={u.apelido ?? u.nomeCompleto} size="sm" />

                        <span className="truncate">
                          {u.apelido ?? u.nomeCompleto}
                        </span>
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
  );
}
