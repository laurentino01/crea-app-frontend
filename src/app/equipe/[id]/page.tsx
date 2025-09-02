"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Hash,
  Mail,
  Shield,
  ArrowLeft,
  User,
  Lock,
} from "lucide-react";
import Avatar from "@/components/Avatar";
import Card from "@/components/Card";
import DetailTabs from "@/components/DetailTabs";
import type { tUserPersisted } from "@/@types/tUser";
import { fetchUserById } from "@/usecases/fetchUserById";
import { updateUser } from "@/usecases/updateUser";
import { userService } from "@/services/LocalStorageUserService";

type PageProps = {
  params: { id: string };
};

export default function UsuarioDetalhes({ params }: PageProps) {
  const [user, setUser] = useState<tUserPersisted | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    nomeCompleto: "",
    apelido: "",
    email: "",
    dataNascimento: "", // yyyy-MM-dd
    isAdm: false,
    ativo: true,
  });

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchUserById(userService, params.id);
        if (!alive) return;
        setUser(result);
      } catch (e) {
        if (!alive) return;
        setError("Não foi possível carregar o usuário.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [params.id]);

  // Sync form from loaded user
  useEffect(() => {
    if (!user) return;
    setForm({
      nomeCompleto: user.nomeCompleto ?? "",
      apelido: user.apelido ?? "",
      email: (user as any).email ?? "",
      dataNascimento: formatDateInput(user.dataNascimento),
      isAdm: !!user.isAdm,
      ativo: (user as any).ativo ?? true,
    });
  }, [user]);

  const formatDate = (d?: Date | string) => {
    if (!d) return "-";
    const dt = typeof d === "string" ? new Date(d) : d;
    if (isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString("pt-BR");
  };

  // formato yyyy-MM-dd para input type="date"
  const formatDateInput = (d?: Date | string) => {
    if (!d) return "";
    const dt = typeof d === "string" ? new Date(d) : d;
    if (isNaN(dt.getTime())) return "";
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // controla hash para alternar entre abas
  useEffect(() => {
    const readHash = () =>
      setHash(
        typeof window !== "undefined"
          ? window.location.hash || "#informacoes"
          : "#informacoes"
      );
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  return (
    <>
      <div className="mb-4 flex gap-4 items-center ">
        <Link
          href="/equipe"
          className="inline-flex h-8 items-center gap-2 text-sm px-3 py-2 rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>
        {!loading && !error && user && (
          <div className="flex items-center gap-3 mb-2 ">
            <Avatar name={user.nomeCompleto || user.apelido} size="md" />

            <div className="min-w-0 flex flex-col">
              <div className="font-extrabold truncate">
                {user.nomeCompleto || user.apelido}
              </div>
              {user.isAdm && (
                <div className="text-sm flex items-center gap-1 w-[fit-content] bg-violet-200 rounded-full px-2 text-violet-900 mt-1">
                  <Shield size={16} /> Administrador
                </div>
              )}
              {user.apelido && (
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  Apelido: {user.apelido}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Tabs de detalhes reutilizáveis */}
      <DetailTabs
        items={[
          { label: "Informações", href: "#informacoes" },
          { label: "Projetos", href: "#projetos" },
          { label: "Histórico", href: "#historico" },
        ]}
      />

      <section className="flex flex-col gap-2 w-full min-h-[200px] bg-neutral-50 dark:bg-neutral-900 p-6 rounded-lg">
        <div className="flex gap-2">
          <User size={22} />
          <h1 className=" mb-4 text-neutral-900 dark:text-neutral-100">
            Detalhes do Usuário
          </h1>
          {!loading && !error && user && (
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
                    onClick={async () => {
                      if (!user) return;
                      try {
                        setSaving(true);
                        setError(null);
                        setSaveMsg(null);
                        const updated = await updateUser(userService, user.id, {
                          nomeCompleto: form.nomeCompleto,
                          apelido: form.apelido,
                          email: form.email,
                          dataNascimento: form.dataNascimento
                            ? new Date(form.dataNascimento)
                            : undefined,
                          isAdm: form.isAdm,
                          ativo: form.ativo,
                        });
                        setUser(updated);
                        setEditing(false);
                        setSaveMsg("Alterações salvas com sucesso.");
                      } catch (e) {
                        setError("Não foi possível salvar as alterações.");
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    {saving ? "Salvando…" : "Salvar"}
                  </button>
                  <button
                    className="px-3 py-1.5 text-sm rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                    disabled={saving}
                    onClick={() => {
                      // revert form to original user values
                      if (user) {
                        setForm({
                          nomeCompleto: user.nomeCompleto ?? "",
                          apelido: user.apelido ?? "",
                          email: (user as any).email ?? "",
                          dataNascimento: formatDateInput(user.dataNascimento),
                          isAdm: !!user.isAdm,
                          ativo: (user as any).ativo ?? true,
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
          <div className="text-green-700 dark:text-green-400 text-sm">{saveMsg}</div>
        )}
        {loading && (
          <div className="text-neutral-600 dark:text-neutral-400">
            Carregando…
          </div>
        )}

        {!loading && error && (
          <div className="text-red-600 dark:text-red-400">{error}</div>
        )}

        {!loading && !error && !user && (
          <div className="text-neutral-600 dark:text-neutral-400">
            Usuário não encontrado.
          </div>
        )}

        {!loading && !error && user && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Aba de Informações - campos desabilitados */}
            {hash !== "#projetos" && hash !== "#historico" && (
              <div className="md:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      value={form.nomeCompleto}
                      disabled={!editing}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, nomeCompleto: e.target.value }))
                      }
                      className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                      Apelido
                    </label>
                    <input
                      type="text"
                      value={form.apelido}
                      disabled={!editing}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, apelido: e.target.value }))
                      }
                      className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        value={form.email}
                        disabled={!editing}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, email: e.target.value }))
                        }
                        className="w-full pl-9 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                      Data de nascimento
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
                        <Calendar size={16} />
                      </div>
                      <input
                        type="date"
                        value={form.dataNascimento}
                        disabled={!editing}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            dataNascimento: e.target.value,
                          }))
                        }
                        className="w-full pl-9 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <input
                      id="isAdmin"
                      type="checkbox"
                      checked={!!form.isAdm}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, isAdm: e.target.checked }))
                      }
                      disabled={!editing}
                      className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-fuchsia-700"
                    />
                    <label
                      htmlFor="isAdmin"
                      className="text-sm text-neutral-800 dark:text-neutral-200 select-none"
                    >
                      Administrador
                    </label>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={!!form.ativo}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, ativo: e.target.checked }))
                      }
                      disabled={!editing}
                      className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-fuchsia-700"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm text-neutral-800 dark:text-neutral-200 select-none"
                    >
                      Ativo
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
