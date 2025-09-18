"use client";

import { useState } from "react";
import { Circle, Eye, EyeOff, User } from "lucide-react";
import Image from "next/image";
import { SubmitHandler, useForm } from "react-hook-form";
import { loginUser } from "@/usecases/loginUser";
import { authService } from "@/services/api/AuthService";
import { tUserAuth } from "@/@types/tUser";

export default function Login() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<tUserAuth>();
  const onSubmit: SubmitHandler<tUserAuth> = async (data) => {
    const res = await loginUser(authService, data);

    console.log(res);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-neutral-950 via-fuchsia-900 to-neutral-950">
      <div className=" mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 pb-16 pt-32">
        <div className="flex items-center justify-center gap-3 text-center">
          <Image
            src="https://www.creamidia.com.br/images/about/logo-about.svg"
            width={56}
            height={60}
            alt="Logo Creamidia"
            priority
          />
          <div className="text-left">
            <div className="text-3xl font-bold text-white dark:text-purple-50">
              Creamidia
            </div>
            <div className="text-lg text-slate-400">Painel de Gestão</div>
          </div>
        </div>
        <div className="w-full max-w-md space-y-8 fixed">
          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-8 shadow-glow backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/70">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Bem-vindo de volta
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Acesse sua conta com os dados cadastrados
              </p>
            </div>

            <div
              id="alert"
              className="hidden mb-4 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-200"
              role="alert"
            ></div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  E-mail
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    aria-invalid={Boolean(errors.email)}
                    {...register("email", {
                      required: "Informe seu email",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "E-mail inválido",
                      },
                    })}
                    className="peer w-full rounded-xl border border-slate-300/80 bg-white/80 px-4 py-3 pr-10 outline-none ring-0 transition focus:border-indigo-500 focus:outline-none dark:border-slate-700/70 dark:bg-slate-950/60"
                    placeholder="voce@exemplo.com"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                </div>
                {errors.email && (
                  <span
                    className="mt-1 block text-xs font-medium text-rose-600"
                    role="alert"
                  >
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                    {...register("password", {
                      required: "Informe sua senha",
                      minLength: {
                        value: 6,
                        message: "A senha deve ter pelo menos 6 caracteres",
                      },
                    })}
                    className="peer w-full rounded-xl border border-slate-300/80 bg-white/80 px-4 py-3 pr-12 outline-none ring-0 transition focus:border-indigo-500 focus:outline-none dark:border-slate-700/70 dark:bg-slate-950/60"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    aria-pressed={isPasswordVisible}
                    aria-label={
                      isPasswordVisible ? "Ocultar senha" : "Mostrar senha"
                    }
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    {isPasswordVisible ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span
                    className="mt-1 block text-xs font-medium text-rose-600"
                    role="alert"
                  >
                    {errors.password.message}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 select-none text-slate-600 dark:text-slate-300">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Lembrar-me
                </label>
              </div>

              <button
                id="submitBtn"
                type="submit"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-fuchsia-900 px-4 py-3 font-medium text-white shadow-glow transition duration-300 hover:scale-105 hover:bg-purple-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 dark:bg-fuchsia-700 dark:hover:bg-fuchsia-600"
              >
                <span>Entrar</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
