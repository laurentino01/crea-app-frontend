"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Tag, User } from "lucide-react";
import Avatar from "@/components/Avatar";
import Card from "@/components/Card";
import DetailTabs from "@/components/DetailTabs";
import type { tClientPersisted } from "@/@types/tClient";
import { fetchClientById } from "@/usecases/fetchClientById";
import { updateClient } from "@/usecases/updateClient";
import { clientService } from "@/services/LocalStorageClientService";

type PageProps = {
  params: { id: string };
};

export default function ClienteDetalhes({ params }: PageProps) {
  const [client, setClient] = useState<tClientPersisted | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    categoria: "",
    descricao: "",
    ativo: true,
  });

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchClientById(clientService, params.id);
        if (!alive) return;
        setClient(result);
      } catch (e) {
        if (!alive) return;
        setError("Não foi possível carregar o cliente.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [params.id]);

  // Sync form from loaded client
  useEffect(() => {
    if (!client) return;
    setForm({
      nome: client.nome ?? "",
      email: client.email ?? "",
      telefone: client.telefone ?? "",
      endereco: client.endereco ?? "",
      categoria: client.categoria ?? "",
      descricao: client.descricao ?? "",
      ativo: client.ativo ?? true,
    });
  }, [client]);

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
          href="/clientes"
          className="inline-flex h-8 items-center gap-2 text-sm px-3 py-2 rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>
        {!loading && !error && client && (
          <div className="flex items-center gap-3 mb-2 ">
            <Avatar name={client.nome} size="md" />

            <div className="min-w-0 flex flex-col">
              <div className="font-extrabold truncate">{client.nome}</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {client.ativo ? (
                  <span className="inline-flex items-center gap-1 w-[fit-content] bg-violet-200 rounded-full px-2 text-violet-900">
                    Ativo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 w-[fit-content] bg-neutral-200 rounded-full px-2 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                    Inativo
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

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
            Detalhes do Cliente
          </h1>
          {!loading && !error && client && (
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
                      if (!client) return;
                      try {
                        setSaving(true);
                        setError(null);
                        setSaveMsg(null);
                        const updated = await updateClient(clientService, client.id, {
                          nome: form.nome,
                          email: form.email,
                          telefone: form.telefone,
                          endereco: form.endereco,
                          categoria: form.categoria,
                          descricao: form.descricao,
                          ativo: form.ativo,
                        });
                        setClient(updated);
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
                      if (client) {
                        setForm({
                          nome: client.nome ?? "",
                          email: client.email ?? "",
                          telefone: client.telefone ?? "",
                          endereco: client.endereco ?? "",
                          categoria: client.categoria ?? "",
                          descricao: client.descricao ?? "",
                          ativo: client.ativo ?? true,
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
          <div className="text-neutral-600 dark:text-neutral-400">Carregando…</div>
        )}

        {!loading && error && (
          <div className="text-red-600 dark:text-red-400">{error}</div>
        )}

        {!loading && !error && !client && (
          <div className="text-neutral-600 dark:text-neutral-400">
            Cliente não encontrado.
          </div>
        )}

        {!loading && !error && client && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hash !== "#projetos" && hash !== "#historico" && (
              <div className="md:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={form.nome}
                      disabled={!editing}
                      onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
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
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        className="w-full pl-9 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                      Telefone
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
                        <Phone size={16} />
                      </div>
                      <input
                        type="tel"
                        value={form.telefone}
                        disabled={!editing}
                        onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                        className="w-full pl-9 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                      Endereço
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
                        <MapPin size={16} />
                      </div>
                      <input
                        type="text"
                        value={form.endereco}
                        disabled={!editing}
                        onChange={(e) => setForm((f) => ({ ...f, endereco: e.target.value }))}
                        className="w-full pl-9 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                      Categoria
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
                        <Tag size={16} />
                      </div>
                      <input
                        type="text"
                        value={form.categoria}
                        disabled={!editing}
                        onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                        className="w-full pl-9 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={form.descricao}
                      disabled={!editing}
                      onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                      placeholder="Observações sobre o cliente"
                      className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none min-h-24"
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={!!form.ativo}
                      onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
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

