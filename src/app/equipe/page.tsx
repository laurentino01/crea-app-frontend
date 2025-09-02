"use client";

import { Calendar, Mail, Phone, Plus, Shield, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { userService } from "../../services/LocalStorageUserService";
import type { tUserCreateDto, tUserPersisted } from "../../@types/tUser";
import Card from "@/components/Card";
import Link from "next/link";
import SearchInput from "@/components/SearchInput";
import Avatar from "@/components/Avatar";

export default function Equipe() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [users, setUsers] = useState<tUserPersisted[]>([]);
  const [search, setSearch] = useState("");
  const [adminFilter, setAdminFilter] = useState<"all" | "admin" | "member">(
    "all"
  );
  const [page, setPage] = useState(1);
  const pageSize = 8;

  type FormValues = {
    nomeCompleto: string;
    apelido: string;
    email: string;
    senha: string;
    senhaConfirm: string;
    dataNascimento?: string; // input type="date" yields string (YYYY-MM-DD)
    isAdm: boolean;
    ativo: boolean;
  };

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { isAdm: false, ativo: true },
  });

  async function reload() {
    const result = await userService.findAll({
      search,
      isAdm:
        adminFilter === "all"
          ? undefined
          : adminFilter === "admin"
          ? true
          : false,
    });
    setUsers(result);
  }

  useEffect(() => {
    reload();
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, adminFilter]);

  const onSubmit = handleSubmit(async (values) => {
    const dto: tUserCreateDto = {
      nomeCompleto: values.nomeCompleto,
      apelido: values.apelido,
      email: values.email,
      senha: values.senha,
      senhaConfirm: values.senhaConfirm,
      dataNascimento: values.dataNascimento
        ? new Date(values.dataNascimento)
        : undefined,
      isAdm: values.isAdm,
      ativo: values.ativo,
    };

    await userService.create(dto);
    reset();
    setModalIsOpen(false);
    await reload();
  });

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(users.length / pageSize));
  }, [users.length]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [users, page]);

  const formatDate = (d?: Date | string) => {
    if (!d) return "-";
    const dt = typeof d === "string" ? new Date(d) : d;
    if (isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString("pt-BR");
  };

  return (
    <>
      <section className="w-full bg-neutral-50 dark:bg-neutral-900 py-5 px-2 rounded-lg flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-3xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <SearchInput
            placeholder="Buscar por nome, apelido ou email"
            value={search}
            onChange={setSearch}
            size="md"
            className="flex-1"
          />

          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-700 dark:text-neutral-300">
              Perfil
            </label>
            <select
              value={adminFilter}
              onChange={(e) =>
                setAdminFilter(e.target.value as "all" | "admin" | "member")
              }
              className="cursor-pointer rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="admin">Administradores</option>
              <option value="member">Membros</option>
            </select>
          </div>

          <div className="flex items-center gap-2 opacity-60">
            <label className="text-sm text-neutral-700 dark:text-neutral-300">
              Projeto
            </label>
            <select className="rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-2 text-sm">
              <option>Todos</option>
              <option>Com projeto</option>
              <option>Sem projeto</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="flex gap-2 items-center bg-fuchsia-900 rounded-full py-2 px-4 text-neutral-50 cursor-pointer hover:bg-purple-400 active:bg-fuchsia-950"
            onClick={() => setModalIsOpen(true)}
          >
            <Plus size={20} />
            Adicionar Membro
          </button>
        </div>
      </section>

      {modalIsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setModalIsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white dark:bg-neutral-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Adicionar Membro
              </h2>
              <button
                aria-label="Fechar"
                className="p-1 cursor-pointer rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setModalIsOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Nome completo <span className="text-fuchsia-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    {...register("nomeCompleto", { required: true })}
                    placeholder="Ex.: Maria Silva"
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Apelido <span className="text-fuchsia-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    {...register("apelido", { required: true })}
                    placeholder="Ex.: Maria"
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Email <span className="text-fuchsia-700">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    {...register("email", { required: true })}
                    placeholder="nome@empresa.com"
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Data de nascimento
                  </label>
                  <input
                    type="date"
                    {...register("dataNascimento")}
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Senha <span className="text-fuchsia-700">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    {...register("senha", { required: true })}
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Confirmação de senha{" "}
                    <span className="text-fuchsia-700">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    {...register("senhaConfirm", { required: true })}
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isAdmin"
                  type="checkbox"
                  {...register("isAdm")}
                  className="cursor-pointer h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-fuchsia-700 focus:ring-fuchsia-600"
                />
                <label
                  htmlFor="isAdmin"
                  className="cursor-pointer text-sm text-neutral-800 dark:text-neutral-200 select-none"
                >
                  Administrador
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  type="checkbox"
                  {...register("ativo")}
                  className="cursor-pointer h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-fuchsia-700 focus:ring-fuchsia-600"
                />
                <label
                  htmlFor="isActive"
                  className="cursor-pointer text-sm text-neutral-800 dark:text-neutral-200 select-none"
                >
                  Ativo
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="cursor-pointer inline-flex items-center gap-2 bg-fuchsia-900 hover:bg-purple-400 active:bg-fuchsia-950 text-white rounded-md px-4 py-2"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="mt-6">
        {users.length === 0 ? (
          <div className="text-center text-neutral-600 dark:text-neutral-400 py-16">
            Nenhum usuário encontrado.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pageItems.map((u, idx) => {
                const name = u.nomeCompleto || u.apelido;

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

                        {u.isAdm && (
                          <div className="text-sm flex items-center justify-center gap-1 w-[fit-content] bg-violet-200 rounded-full px-2 text-violet-900 ">
                            <Shield size={16} /> Administrador
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Details - vazio como no modelo */}
                    <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-3"></div>

                    {/* Contact */}
                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <i className="fas fa-envelope text-neutral-500" />
                        <Mail size={16} />
                        <span className="truncate">{u.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <i className="fas fa-phone text-neutral-500" />
                        <Phone size={16} />
                        <span>(1) 99999-9999</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <i className="fas fa-calendar-alt text-neutral-500" />
                        <Calendar size={16} />
                        <span>Desde: {formatDate(u.dataNascimento)}</span>
                      </div>
                    </div>

                    {/* Projects */}
                    <div className="bg-neutral-100 dark:bg-white/5 p-3 rounded-lg mb-4">
                      <div className="text-[13px] text-neutral-500 mb-1">
                        Projetos
                      </div>
                      <div className="font-extrabold text-lg">26</div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/equipe/${u.id}`}
                        className="px-3 py-2 rounded-full font-bold text-[13px] bg-fuchsia-900 text-neutral-100 transition-colors duration-200  hover:bg-fuchsia-400 active:bg-fuchsia-950 cursor-pointer"
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
