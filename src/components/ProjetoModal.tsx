"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import SearchInput from "@/components/SearchInput";
import Avatar from "@/components/Avatar";
import { projectService } from "@/services/api/ProjetoService";
import type {
  tProjectCreateDto,
  tProjetoCriticidade,
  tProjetoUsuarioDto,
} from "@/@types/tProject";
import { ProjetoEtapa, PrioridadeProjeto } from "@/@types/tProject";
import { tUser } from "@/@types/tUser";
import { fetchUsers } from "@/usecases/userCases";
import { userService } from "@/services/api/UserServices";
import { tCliente } from "@/@types/tClient";
import { clienteService } from "@/services/api/ClienteService";
import { fetchClientes } from "@/usecases/clienteCases";
import { SubmitHandler, useForm } from "react-hook-form";
import { authService } from "@/services/api/AuthService";
import { create } from "@/usecases/projetoCases";
import { redirect } from "next/navigation";
import { useToast } from "@/hooks/useToast";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  reload: () => Promise<void> | void;
};

export default function ProjetoModal({ isOpen, onClose, reload }: Props) {
  const [allUsers, setAllUsers] = useState<tUser[]>([]);
  const [allClientes, setAllClientes] = useState<tCliente[]>([]);
  const [selectedEquipe, setSelectedEquipe] = useState<tProjetoUsuarioDto[]>(
    []
  );
  const { push } = useToast();
  const [saving, setSaving] = useState(false);
  const [teamSearch, setTeamSearch] = useState("");
  const [clientesSearch, setClientesSearch] = useState("");
  const { register, handleSubmit } = useForm<tProjectCreateDto>();

  const filteredUsers = useMemo(() => {
    const term = teamSearch.trim().toLowerCase();
    if (!term) return allUsers;
    return allUsers.filter((u) => {
      const nome = (u.apelido || "").toLowerCase();
      const apelido = (u.apelido || "").toLowerCase();
      return nome.includes(term) || apelido.includes(term);
    });
  }, [allUsers, teamSearch]);

  const filteredClientes = useMemo(() => {
    const term = clientesSearch.trim().toLowerCase();
    if (!term) return allClientes;
    return allClientes.filter((u) => {
      const nome = (u.nome || "").toLowerCase();
      const apelido = (u.nome || "").toLowerCase();
      return nome.includes(term) || apelido.includes(term);
    });
  }, [allClientes, clientesSearch]);

  const createProjetct: SubmitHandler<tProjectCreateDto> = async (
    data: tProjectCreateDto
  ) => {
    toggleEquipe(authService.getUserId());
    data.equipe = selectedEquipe;
    const novopProjeto = await create(projectService, data);

    if (novopProjeto) {
      push({
        type: "success",
        message: "Projeto Criado com sucesso! Etapa: Aguardando Arquivos. :)",
      });
      redirect(`projetos/${novopProjeto.id}`);
    } else {
      push({
        type: "error",
        message:
          "Oops, Algo deu errado :(. Por favor, tente novamente mais tarde.",
      });
    }
  };

  function toggleEquipe(id: number) {
    const hasUser = selectedEquipe.find((u) => u.usuario === id);

    if (hasUser) {
      setSelectedEquipe(selectedEquipe.filter((u) => u.usuario !== id));
    } else {
      setSelectedEquipe([...selectedEquipe, { usuario: id }]);
    }
  }

  async function fetchAllUsers() {
    const res = await fetchUsers(userService);
    return res;
  }

  async function fetchAllClientes() {
    const res = await fetchClientes(clienteService);
    return res;
  }

  useEffect(() => {
    fetchAllUsers().then((data) => {
      setAllUsers(data);
    });
    fetchAllClientes().then((data) => {
      setAllClientes(data);
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
        {/* Header */}
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

        <form className="space-y-4" onSubmit={handleSubmit(createProjetct)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                Nome <span className="text-fuchsia-700">*</span>
              </label>
              <input
                type="text"
                required
                {...register("nome", { required: true })}
                placeholder="Ex.: Edição de vídeo institucional"
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
              />
            </div>
            {/* Link */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                Link Arquivos<span className="text-fuchsia-700">*</span>
              </label>
              <input
                type="text"
                {...register("linkArquivos", { required: false })}
                placeholder="Ex.: https://drive.google/..."
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
              />
            </div>
            {/* Descrição */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                Descrição
              </label>
              <textarea
                {...register("descricao", { required: false })}
                placeholder="Contexto, escopo e observações do projeto"
                className="w-full min-h-24 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
              />
            </div>
            {/* Prioridade */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                Prioridade
              </label>
              <select
                {...register("prioridade", { required: true })}
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
              >
                <option value={PrioridadeProjeto.BAIXA}>Baixa</option>
                <option value={PrioridadeProjeto.MEDIA}>Média</option>
                <option value={PrioridadeProjeto.ALTA}>Alta</option>
                <option value={PrioridadeProjeto.URGENTE}>Urgente</option>
                <option value={PrioridadeProjeto.CRITICO}>Crítico</option>
              </select>
            </div>
            {/* Data Inicio */}
            <div>
              <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                Data Início <span className="text-fuchsia-700">*</span>
              </label>
              <input
                type="date"
                {...register("dataInicio", { required: true })}
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                required
              />
            </div>
            {/* Fim previsto */}
            <div>
              <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                Data Fim previsto <span className="text-fuchsia-700">*</span>
              </label>
              <input
                type="date"
                {...register("dataFim", { required: true })}
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                required
              />
            </div>
          </div>
          {/* Clientes */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3">
            <div className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-2">
              Clientes
            </div>
            {allClientes.length > 0 && (
              <div className="mb-2">
                <SearchInput
                  placeholder="Buscar membros da equipe"
                  value={clientesSearch}
                  size="sm"
                />
              </div>
            )}
            {allClientes.length === 0 ? (
              <div className="text-sm text-neutral-500">Nenhum cliente.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-auto pr-1">
                {filteredClientes.map((c) => {
                  return (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 text-sm cursor-pointer select-none"
                    >
                      <input
                        type="radio"
                        id={`cliente_${c.id}`}
                        value={c.id}
                        {...register("cliente", { required: true })}
                        className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-fuchsia-700 focus:ring-fuchsia-600"
                      />
                      <span className="inline-flex items-center gap-2">
                        <Avatar name={c.nome} size="sm" />

                        <span className="truncate">{c.nome}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
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
                  size="sm"
                />
              </div>
            )}
            {allUsers.length === 0 ? (
              <div className="text-sm text-neutral-500">Nenhum usuário.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-auto pr-1">
                {filteredUsers.map((u) => {
                  const checked = selectedEquipe.some(
                    (user) => user.usuario === u.id
                  );
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
          {/* Adicionar */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer inline-flex items-center gap-2 bg-fuchsia-900 hover:bg-purple-400 active:bg-fuchsia-950 text-white rounded-md px-4 py-2 disabled:opacity-50"
            >
              <Plus />
              {saving ? "Salvando..." : "Adicionar Membro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
