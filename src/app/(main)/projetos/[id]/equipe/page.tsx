"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { projectService } from "@/services/api/ProjetoService";

import { userService } from "@/services/api/UserServices";
import type { tProjectPersisted, tUsuarioEquipe } from "@/@types/tProject";
import type { tUser, tUserPersisted } from "@/@types/tUser";
import Avatar from "@/components/Avatar";
import SearchInput from "@/components/SearchInput";
import { addProjectEquipeMember } from "@/usecases/addProjectEquipeMember";
import { removeProjectEquipeMember } from "@/usecases/removeProjectEquipeMember";
import { Plus } from "lucide-react";
import { findEquipe } from "@/usecases/projetoCases";
import { fetchUsers } from "@/usecases/userCases";

export default function ProjetoDetalheEquipePage() {
  const params = useParams<{ id: string }>();

  const [project, setProject] = useState<tProjectPersisted | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Equipe
  const [allUsers, setAllUsers] = useState<tUser[]>([]);
  const [equipe, setEquipe] = useState<tUsuarioEquipe[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [teamSearch, setTeamSearch] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>("");

  async function fetchEquipe() {
    const res = await findEquipe(projectService, +params.id);
    setEquipe(res);
  }
  async function fetchUsuarios() {
    const res = await fetchUsers(userService);
    setAllUsers(res);
  }
  useEffect(() => {
    fetchEquipe();
    fetchUsuarios();
  }, []);

  const equipeIds = useMemo(
    () => new Set((project?.equipe ?? []).map((m) => m.usuario)),
    [project?.equipe]
  );

  const availableUsers = useMemo(() => {
    const term = teamSearch.trim().toLowerCase();
    return allUsers.filter((u) => {
      if (equipeIds.has(u.id)) return false;
      if (!term) return true;
      const nome = (u.nomecompleto || u.apelido || "").toLowerCase();

      return nome.includes(term);
    });
  }, [allUsers, equipeIds, teamSearch]);

  return (
    <>
      <div className="flex items-center mb-4 gap-2">
        <span className="ml-auto text-sm text-neutral-600 dark:text-neutral-300">
          {equipe.length || 0} membros
        </span>
      </div>

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
                      {u.apelido ?? u.nomecompleto}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex sm:justify-end">
                <button
                  className="flex gap-3 items-center px-3 py-2 rounded-md bg-fuchsia-900 text-white hover:bg-fuchsia-700 disabled:opacity-50 cursor-pointer"
                  disabled={!selectedUserToAdd || addingMember}
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
        {equipe.map((usuario, idx) => {
          return (
            <div
              key={idx}
              className="flex items-center gap-3 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 bg-white dark:bg-neutral-900"
            >
              <Avatar
                name={`${usuario.apelido ?? usuario.nomecompleto}`}
                size="sm"
              />
              <div className="min-w-0">
                <div className="font-medium truncate">
                  {usuario.apelido ?? usuario.nomecompleto}
                </div>
                <div className="text-xs text-neutral-500 truncate">
                  ID: {usuario.id}
                </div>
              </div>
              <div className="ml-auto">
                <button className="px-3 py-1.5 text-sm rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"></button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
