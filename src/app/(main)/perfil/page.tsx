"use client";

import { tUser, tUserSession, tUserUpdateDto, UserRole } from "@/@types/tUser";
import Avatar from "@/components/Avatar";
import DetailTabs from "@/components/DetailTabs";
import { useToast } from "@/hooks/useToast";
import { authService } from "@/services/api/AuthService";
import { userService } from "@/services/api/UserServices";
import { fetchOne, update } from "@/usecases/userCases";
import handleDataUpdate from "@/utils/handleDataUpdate";
import { Eye, EyeOff, Mail, Shield, User } from "lucide-react";
import { redirect, useParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function () {
  const [user, setUserPerfil] = useState<tUser>({} as tUser);
  const [editando, setEditando] = useState<boolean>(false);
  const [senhaDigitada, setSenhaDigitada] = useState<string>("");
  const { push } = useToast();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<tUserUpdateDto>();
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const isAdm = authService.isAdm();

  const senha = watch("password");

  const onSubmit = async (data: tUserUpdateDto) => {
    const { id, ...rest } = user;
    const dataUpdate = handleDataUpdate<tUserUpdateDto>(
      data,
      rest as tUserUpdateDto
    );

    if (dataUpdate.hasntChanges) {
      setEditando(false);
      push({ type: "info", message: "Nada foi alterado." });
      return;
    }

    const newData = dataUpdate.data;

    newData.primeiroAcesso = authService.getUserData()?.primeiroLogin;
    newData.id = Number(user.id);

    const response = await update(userService, newData);

    if (response.res) {
      push({ type: "success", message: "Dados alterados com sucesso! :)" });
      setEditando(false);
      if (response.senhaAlterada) {
        alert("Senha alterada. Por favor, faça login novamente no portal.");
        authService.logout();
        redirect("login");
      }
    } else {
      setEditando(false);
      push({
        type: "error",
        message:
          "Oops, algo deu errado :(. Por favor, tente novamente mais tarde",
      });
    }
  };

  async function fetchUser() {
    const id = authService.getUserId();
    const user = await fetchOne(userService, id);
    if (user) {
      setUserPerfil(user);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <>
      <div className="mb-4 flex gap-4 items-center ">
        <div className="flex items-center gap-3 mb-2 ">
          <Avatar name={`${user.apelido ?? user.nomeCompleto}`} size="md" />
          <div className="min-w-0 flex flex-col">
            <div className="font-extrabold truncate">
              {user.apelido ?? user.nomeCompleto}
              {isAdm && (
                <div className="text-sm flex items-center gap-1 w-[fit-content] bg-violet-200 rounded-full px-2 text-violet-900 mt-1">
                  <Shield size={16} /> Administrador
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <DetailTabs
        items={[
          { label: "Informações", href: "#informacoes" },
          { label: "Projetos", href: "#projetos" },
          { label: "Histórico", href: "#historico" },
        ]}
      />

      <section className="flex flex-col gap-2 w-full min-h-[200px] bg-neutral-50 dark:bg-neutral-900 p-6 rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-2">
            <User size={22} />
            <h1 className=" mb-4 text-neutral-900 dark:text-neutral-100">
              Suas informações
            </h1>
            <div className="ml-auto flex items-center gap-2">
              {!editando && (
                <button
                  onClick={() => setEditando(true)}
                  className="px-3 py-1.5 text-sm rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Editar
                </button>
              )}
              {editando && (
                <>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sm rounded-md bg-fuchsia-900 text-white hover:bg-fuchsia-700 disabled:opacity-50 cursor-pointer"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditando(false)}
                    className="px-3 py-1.5 text-sm rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    defaultValue={user.nomeCompleto}
                    {...register("nomeCompleto")}
                    disabled={!editando}
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                    Apelido
                  </label>
                  <input
                    type="text"
                    defaultValue={user.apelido}
                    {...register("apelido")}
                    disabled={!editando}
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
                      defaultValue={user.email}
                      {...register("email")}
                      disabled={true}
                      className="w-full pl-9 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <select
                    {...register("role")}
                    defaultValue={isAdm ? UserRole.ADM : UserRole.EDITOR}
                  >
                    <option value={UserRole.ADM}>Administrador</option>
                    <option value={UserRole.EDITOR}>Editor</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Nova senha
                  </label>
                  <div className="relative ">
                    <input
                      id="password"
                      disabled={!editando}
                      type={isPasswordVisible ? "text" : "password"}
                      {...register("password", {
                        pattern: {
                          value:
                            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
                          message:
                            "A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e símbolo",
                        },
                      })}
                      onChange={(e) => setSenhaDigitada(e.target.value)}
                      autoComplete="current-password"
                      className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      {isPasswordVisible ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <span className="text-red-600">
                    {errors.password && <p>{errors.password.message}</p>}
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="passwordConfirm"
                    className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Confirmar nova senha
                  </label>
                  <div className="relative">
                    <input
                      id="passwordConfirm"
                      type={isPasswordVisible ? "text" : "password"}
                      required={senhaDigitada !== ""}
                      autoComplete="current-password"
                      {...register("passwordConfirm", {
                        validate: (value) =>
                          value === senha || "As senhas devem ser iguais",
                      })}
                      disabled={!editando}
                      className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      {isPasswordVisible ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <span className="text-red-600">
                    {errors.passwordConfirm && (
                      <p>{errors.passwordConfirm.message}</p>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </section>
    </>
  );
}
