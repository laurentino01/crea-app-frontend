"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { userService } from "@/services/LocalStorageUserService";
import type { tUserCreateDto } from "@/@types/tUser";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => Promise<void> | void;
};

type FormValues = {
  nomeCompleto: string;
  apelido: string;
  email: string;
  senha: string;
  senhaConfirm: string;
  dataNascimento?: string;
  isAdm: boolean;
  ativo: boolean;
};

export default function UsuarioModal({ isOpen, onClose, onCreated }: Props) {
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { isAdm: false, ativo: true },
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

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
    handleClose();
    if (onCreated) {
      await onCreated();
    }
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
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
            onClick={handleClose}
            type="button"
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
  );
}
