"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { projectService } from "@/services/LocalStorageProjectService";
import { userService } from "@/services/LocalStorageUserService";
import type { tProjectPersisted } from "@/@types/tProject";
import type { tUserPersisted } from "@/@types/tUser";
import Avatar from "@/components/Avatar";
import SearchInput from "@/components/SearchInput";
import { addProjectEquipeMember } from "@/usecases/addProjectEquipeMember";
import { removeProjectEquipeMember } from "@/usecases/removeProjectEquipeMember";
import { Plus } from "lucide-react";

export default function ProjetoDetalheEquipePage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id as string | undefined;

  const [project, setProject] = useState<tProjectPersisted | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Equipe
  const [allUsers, setAllUsers] = useState<tUserPersisted[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [teamSearch, setTeamSearch] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
        if (!projectId) return;
        const [proj, users] = await Promise.all([
          projectService.findById(projectId),
          userService.findAll(),
        ]);
        setAllUsers(users);
        setUserNames(
          Object.fromEntries(
            users.map((u) => [u.id, u.nomeCompleto || u.apelido || "—"])
          )
        );
        if (!proj) {
          setError("Projeto não encontrado");
          return;
        }
        setProject(proj);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  const equipeIds = useMemo(
    () => new Set((project?.equipe ?? []).map((m) => m.idUsuario)),
    [project?.equipe]
  );

  const availableUsers = useMemo(() => {
    const term = teamSearch.trim().toLowerCase();
    return allUsers.filter((u) => {
      if (equipeIds.has(u.id)) return false;
      if (!term) return true;
      const nome = (u.nomeCompleto || u.apelido || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return nome.includes(term) || email.includes(term);
    });
  }, [allUsers, equipeIds, teamSearch]);

  async function handleAddMember() {
    if (!project || !selectedUserToAdd) return;
    try {
      setError(null);
      setAddingMember(true);
      const updated = await addProjectEquipeMember(
        projectService,
        project.id,
        selectedUserToAdd
      );
      setProject(updated);
      setSelectedUserToAdd("");
      setTeamSearch("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível adicionar o membro."
      );
    } finally {
      setAddingMember(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!project) return;
    try {
      setError(null);
      setRemovingUserId(userId);
      const updated = await removeProjectEquipeMember(
        projectService,
        project.id,
        userId
      );
      setProject(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível remover o membro."
      );
    } finally {
      setRemovingUserId(null);
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
    <section
      id="equipe"
      className="rounded-lg dark:bg-neutral-900 bg-neutral-100 p-4"
    >
      <div className="flex items-center mb-4 gap-2">
        <h2 className="text-base font-semibold">Equipe do Projeto</h2>
        <span className="ml-auto text-sm text-neutral-600 dark:text-neutral-300">
          {project?.equipe?.length || 0} membros
        </span>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 mb-3">
          {error}
        </div>
      )}

      {/* Adicionar membro */}
      <div className="border  border-neutral-200 dark:border-neutral-800 rounded-lg p-3 mb-4">
        <div className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-2">
          Adicionar membro
        </div>
        <div className="flex justify-between items-center">
          {allUsers.length > 0 ? (
            <div className="flex w-full justify-between items-center">
              <div className="flex items-center w-full gap-3">
                <SearchInput
                  placeholder="Buscar usuários para adicionar"
                  value={teamSearch}
                  onChange={setTeamSearch}
                  size="sm"
                  className=""
                />
                <select
                  value={selectedUserToAdd}
                  onChange={(e) => setSelectedUserToAdd(e.target.value)}
                  className="rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1"
                >
                  <option value="">
                    {availableUsers.length === 0
                      ? "Nenhum usuário disponível"
                      : "Selecione um usuário"}
                  </option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nomeCompleto || u.apelido || u.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex sm:justify-end">
                <button
                  className="flex gap-3 items-center px-3 py-2 rounded-md bg-fuchsia-900 text-white hover:bg-fuchsia-700 disabled:opacity-50 cursor-pointer"
                  disabled={!selectedUserToAdd || addingMember}
                  onClick={handleAddMember}
                >
                  <Plus size={16} />
                  {addingMember ? "Adicionando…" : "Adicionar"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-neutral-500">
              Nenhum usuário cadastrado.
            </div>
          )}
        </div>
      </div>

      {/* Lista de membros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(project?.equipe ?? []).length === 0 ? (
          <div className="text-sm text-neutral-600 dark:text-neutral-300">
            Nenhum membro na equipe.
          </div>
        ) : (
          (project?.equipe ?? []).map((m) => {
            const name = userNames[m.idUsuario] || "Usuário";
            return (
              <div
                key={m.idUsuario}
                className="flex items-center gap-3 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 bg-white dark:bg-neutral-900"
              >
                <Avatar name={name} size="sm" />
                <div className="min-w-0">
                  <div className="font-medium truncate">{name}</div>
                  <div className="text-xs text-neutral-500 truncate">
                    ID: {m.idUsuario}
                  </div>
                </div>
                <div className="ml-auto">
                  <button
                    className="px-3 py-1.5 text-sm rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
                    onClick={() => handleRemoveMember(m.idUsuario)}
                    disabled={removingUserId === m.idUsuario}
                  >
                    {removingUserId === m.idUsuario ? "Removendo…" : "Remover"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
