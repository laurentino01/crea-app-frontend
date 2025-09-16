"use client";

import { useEffect, useMemo, useState } from "react";
import {
  clearUsersLocalStorage,
  getUsersFromLocalStorage,
  seedUsersToLocalStorage,
} from "@/lib/users.localstorage";
import {
  clearClientsLocalStorage,
  getClientsFromLocalStorage,
  seedClientsToLocalStorage,
} from "@/lib/clients.localstorage";
import {
  clearProjectsLocalStorage,
  getProjectsFromLocalStorage,
  seedProjectsToLocalStorage,
} from "@/lib/projects.localstorage";
import { seedCriteriosToLocalStorage } from "@/lib/criterios.localstorage";

export default function MocksPage() {
  const [tick, setTick] = useState(0);
  const users = useMemo(() => getUsersFromLocalStorage() ?? [], [tick]);
  const clients = useMemo(() => getClientsFromLocalStorage() ?? [], [tick]);
  const projects = useMemo(() => getProjectsFromLocalStorage() ?? [], [tick]);

  useEffect(() => {
    const onChange = () => setTick((v) => v + 1);
    window.addEventListener("storage", onChange);
    return () => window.removeEventListener("storage", onChange);
  }, []);

  function refresh() {
    setTick((v) => v + 1);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Mocks de Dados</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Ações rápidas</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            className="px-3 py-1.5 rounded bg-neutral-800 text-white hover:bg-neutral-700"
            onClick={() => {
              seedUsersToLocalStorage({ force: true });
              seedClientsToLocalStorage({ force: true });
              seedProjectsToLocalStorage({ force: true });
              seedCriteriosToLocalStorage({ force: true });
              refresh();
            }}
          >
            Semear tudo (force)
          </button>
          <button
            className="px-3 py-1.5 rounded bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
            onClick={() => {
              clearProjectsLocalStorage();
              clearUsersLocalStorage();
              clearClientsLocalStorage();
              refresh();
            }}
          >
            Limpar tudo
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Usuários ({users.length})</h3>
            <div className="flex gap-2">
              <button
                className="px-2 py-1 rounded bg-neutral-800 text-white"
                onClick={() => {
                  seedUsersToLocalStorage({ force: true });
                  refresh();
                }}
              >
                Semear
              </button>
              <button
                className="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-700"
                onClick={() => {
                  clearUsersLocalStorage();
                  refresh();
                }}
              >
                Limpar
              </button>
            </div>
          </div>
          <ul className="text-sm space-y-1 max-h-64 overflow-auto">
            {users.map((u) => (
              <li key={u.id} className="flex justify-between gap-2">
                <span>
                  {u.apelido} · {u.email}
                </span>
                <span className="opacity-70">{u.isAdm ? "ADM" : ""}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border rounded p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Clientes ({clients.length})</h3>
            <div className="flex gap-2">
              <button
                className="px-2 py-1 rounded bg-neutral-800 text-white"
                onClick={() => {
                  seedClientsToLocalStorage({ force: true });
                  refresh();
                }}
              >
                Semear
              </button>
              <button
                className="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-700"
                onClick={() => {
                  clearClientsLocalStorage();
                  refresh();
                }}
              >
                Limpar
              </button>
            </div>
          </div>
          <ul className="text-sm space-y-1 max-h-64 overflow-auto">
            {clients.map((c) => (
              <li key={c.id} className="flex justify-between gap-2">
                <span>
                  {c.nome} · {c.categoria}
                </span>
                <span className="opacity-70">{c.ativo ? "Ativo" : "Inativo"}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border rounded p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Projetos ({projects.length})</h3>
            <div className="flex gap-2">
              <button
                className="px-2 py-1 rounded bg-neutral-800 text-white"
                onClick={() => {
                  seedProjectsToLocalStorage({ force: true });
                  refresh();
                }}
              >
                Semear
              </button>
              <button
                className="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-700"
                onClick={() => {
                  clearProjectsLocalStorage();
                  refresh();
                }}
              >
                Limpar
              </button>
            </div>
          </div>
          <ul className="text-sm space-y-1 max-h-64 overflow-auto">
            {projects.map((p) => (
              <li key={p.id} className="flex justify-between gap-2">
                <span>
                  {p.nome} · {p.criticidade}
                </span>
                <span className="opacity-70">{p.etapa}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

