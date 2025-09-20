"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Check, X } from "lucide-react";
import { clienteService } from "@/services/api/ClienteService";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  tClienteCategoria,
  tClienteCategoriaCreateDto,
} from "@/@types/tClient";
import { createCategoria, findAllCategorias } from "@/usecases/clienteCases";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  reload: () => Promise<void> | void;
};

export default function ClienteModal({ isOpen, onClose, reload }: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [categories, setCategories] = useState<tClienteCategoria[]>([]);
  const [descricao, setDescricao] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [selectedCategoria, setSelectedCategoria] =
    useState<string>("__none__");
  const [newCategoria, setNewCategoria] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<tClienteCategoriaCreateDto>();
  const onSubmitCategoria: SubmitHandler<tClienteCategoriaCreateDto> = async (
    data
  ) => {
    const res = await createCategoria(clienteService, data);
    categories.push(res);
    setSelectedCategoria(String(res.id));
    return;
  };

  async function fetchCategorias() {
    const res = await findAllCategorias(clienteService);
    return res;
  }

  useEffect(() => {
    fetchCategorias().then((data) => {
      setCategories(data);
    });
  }, []);
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={() => !saving && onClose()}
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
            onClick={() => !saving && onClose()}
          >
            <X size={18} />
          </button>
        </div>

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
              Categoria
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
              >
                <option value="__none__">Categorias</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat.id}>
                    {cat.titulo}
                  </option>
                ))}
                <option value="__new__">+ Nova categoria...</option>
              </select>

              {selectedCategoria === "__new__" && (
                <div className="flex gap-2">
                  <input
                    className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 w-[100%] focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                    placeholder="Digite o nome da categoria"
                    value={newCategoria}
                    {...register("titulo", { required: true })}
                    onChange={(e) => setNewCategoria(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="dark:hover:bg-neutral-800 hover:bg-neutral-50 rounded-full p-2   cursor-pointer transition duration-300 hover:text-green-500"
                    onClick={handleSubmit(onSubmitCategoria)}
                  >
                    <Check />
                  </button>
                </div>
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
      </div>
    </div>
  );
}
