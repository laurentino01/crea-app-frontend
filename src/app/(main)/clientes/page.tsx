"use client";

import { Mail, MapPin, Phone, Plus, Shield, Tag, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SearchInput from "@/components/SearchInput";
import Card from "@/components/Card";
import ClientProjectsEtapasDoughnut from "@/components/ClientProjectsEtapasDoughnut";
import Avatar from "@/components/Avatar";
import type { tClientPersisted } from "@/@types/tClient";
import { clientService } from "@/services/LocalStorageClientService";
import { redirect, RedirectType } from "next/navigation";

type StatusFilter = "all" | "active" | "inactive";

export default function Clientes() {
  const [clients, setClients] = useState<tClientPersisted[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Add client modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [selectedCategoria, setSelectedCategoria] =
    useState<string>("__none__");
  const [newCategoria, setNewCategoria] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redireciona para projetos
  useEffect(() => {
    redirect("projetos", RedirectType.replace);
  });

  // Load distinct categories (from entire dataset) once
  useEffect(() => {
    async function loadCategories() {
      const all = await clientService.findAll();
      const cats = Array.from(
        new Set(
          all
            .map((c) => (c.categoria || "").trim())
            .filter((c) => c && c.length > 0)
        )
      ).sort((a, b) => a.localeCompare(b));
      setAllCategories(cats);
    }
    loadCategories();
  }, []);

  async function reload() {
    const ativo =
      statusFilter === "all"
        ? undefined
        : statusFilter === "active"
        ? true
        : false;
    const categoria = categoriaFilter === "all" ? undefined : categoriaFilter;
    const result = await clientService.findAll({ search, categoria, ativo });
    setClients(result);
  }

  useEffect(() => {
    reload();
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoriaFilter, statusFilter]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(clients.length / pageSize));
  }, [clients.length]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return clients.slice(start, start + pageSize);
  }, [clients, page]);

  return (
    <>
      {/* Toolbar */}
      <section className="w-full bg-neutral-50 dark:bg-neutral-900 py-5 px-2 rounded-lg flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-3xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <SearchInput
            placeholder="Buscar por nome, email, telefone ou descrição"
            value={search}
            onChange={setSearch}
            size="md"
            className="flex-1"
          />

          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-700 dark:text-neutral-300">
              Categoria
            </label>
            <select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
              className="cursor-pointer rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-2 text-sm"
            >
              <option value="all">Todas</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-700 dark:text-neutral-300">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="cursor-pointer rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="flex gap-2 items-center bg-fuchsia-900 rounded-full py-2 px-4 text-neutral-50 cursor-pointer hover:bg-purple-400 active:bg-fuchsia-950"
            onClick={() => {
              setIsAddOpen(true);
              setError(null);
            }}
          >
            <Plus size={20} />
            Adicionar Cliente
          </button>
        </div>
      </section>

      {/* Add Client Modal */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => !saving && setIsAddOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white dark:bg-neutral-900 p-6 shadow-xl text-neutral-900 dark:text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Adicionar Cliente
              </h2>
              <button
                aria-label="Fechar"
                className="p-1 cursor-pointer rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => !saving && setIsAddOpen(false)}
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

                const categoriaValue =
                  selectedCategoria === "__new__"
                    ? newCategoria.trim()
                    : selectedCategoria === "__none__"
                    ? ""
                    : selectedCategoria;

                if (!nome.trim()) {
                  setError("Nome é obrigatório");
                  return;
                }
                // Email opcionalmente vazio, mas assegura string
                // Categoria pode ser vazia, mas se __new__ precisa preencher
                if (selectedCategoria === "__new__" && !categoriaValue) {
                  setError("Informe o nome da nova categoria");
                  return;
                }

                try {
                  setSaving(true);
                  await clientService.create({
                    nome: nome.trim(),
                    email: email.trim(),
                    telefone: telefone.trim(),
                    endereco: endereco.trim(),
                    categoria: categoriaValue,
                    descricao: descricao.trim(),
                    ativo,
                  });

                  // Atualiza lista e categorias
                  await reload();
                  if (categoriaValue) {
                    setAllCategories((prev) => {
                      if (prev.includes(categoriaValue)) return prev;
                      return [...prev, categoriaValue].sort((a, b) =>
                        a.localeCompare(b)
                      );
                    });
                  }

                  // Limpa formulário e fecha
                  setNome("");
                  setEmail("");
                  setTelefone("");
                  setEndereco("");
                  setDescricao("");
                  setAtivo(true);
                  setSelectedCategoria("__none__");
                  setNewCategoria("");
                  setIsAddOpen(false);
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Erro ao salvar cliente"
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
                <div>
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Nome <span className="text-fuchsia-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex.: ACME Ltda"
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@cliente.com"
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 91234-5678"
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua Exemplo, 123"
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Categoria
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <select
                      className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                      value={selectedCategoria}
                      onChange={(e) => setSelectedCategoria(e.target.value)}
                    >
                      <option value="__none__">Selecionar...</option>
                      {allCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__new__">+ Nova categoria...</option>
                    </select>

                    {selectedCategoria === "__new__" && (
                      <input
                        className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                        placeholder="Digite o nome da categoria"
                        value={newCategoria}
                        onChange={(e) => setNewCategoria(e.target.value)}
                      />
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Observações sobre o cliente"
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-600 min-h-20"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    id="clienteAtivo"
                    type="checkbox"
                    className="cursor-pointer h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-fuchsia-700 focus:ring-fuchsia-600"
                    checked={ativo}
                    onChange={(e) => setAtivo(e.target.checked)}
                  />
                  <label
                    htmlFor="clienteAtivo"
                    className="cursor-pointer text-sm text-neutral-800 dark:text-neutral-200 select-none"
                  >
                    Cliente ativo
                  </label>
                </div>
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
      )}

      {/* Lista */}
      <section className="mt-6">
        {clients.length === 0 ? (
          <div className="text-center text-neutral-600 dark:text-neutral-400 py-16">
            Nenhum cliente encontrado.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pageItems.map((c, idx) => {
                const name = c.nome;
                return (
                  <Card key={idx}>
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-[18px] text-white ">
                        {<Avatar name={name} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold mb-1 truncate">
                          {name}
                        </div>

                        {c.ativo && (
                          <div className="text-sm flex items-center justify-center gap-1 w-[fit-content] bg-violet-200 rounded-full px-2 text-violet-900 ">
                            <Shield size={16} /> Ativo
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Details - vazio como no modelo */}
                    <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-3"></div>

                    {/* Contact / Info */}
                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={16} />
                        <span className="truncate">{c.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={16} />
                        <span className="truncate">{c.telefone || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={16} />
                        <span className="truncate">{c.endereco || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Tag size={16} />
                        <span className="truncate">{c.categoria || "-"}</span>
                      </div>
                    </div>

                    {/* Projects Doughnut */}
                    <ClientProjectsEtapasDoughnut
                      clientId={c.id}
                      className="mb-4"
                    />

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/clientes/${c.id}`}
                        className="px-3 py-2 rounded-full font-bold text-[13px] bg-fuchsia-900 text-neutral-100 transition-colors duration-200 hover:bg-fuchsia-400 active:bg-fuchsia-950 cursor-pointer"
                      >
                        Ver mais
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                className="px-3 py-2 rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Anterior
              </button>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Página {page} de {totalPages}
              </span>
              <button
                className="px-3 py-2 rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Próxima
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
