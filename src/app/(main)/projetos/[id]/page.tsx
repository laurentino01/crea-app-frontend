"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { projectService } from "@/services/api/ProjetoService";
import {
  EtapaStatus,
  ProjetoEtapa,
  type tProject,
  type tProjectUpdateDto,
} from "@/@types/tProject";
import {
  findById,
  findByProjetoEStatus,
  updateInformacoes,
} from "@/usecases/projetoCases";
import { formataData } from "@/utils/formataData";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/useToast";
import handleDataUpdate from "@/utils/handleDataUpdate";
import { fetchClientes } from "@/usecases/clienteCases";
import { clienteService } from "@/services/api/ClienteService";
import { tCliente } from "@/@types/tClient";

export default function ProjetoDetalhesPage() {
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<tProject | null>(null);
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [clientes, setClientes] = useState<tCliente[] | null>(null);
  const [dataFinalizado, setDataFinalizado] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [isFinalizado, setIsFinalizado] = useState<boolean>(false);
  const { push } = useToast();
  const { register, handleSubmit } = useForm<tProjectUpdateDto>();

  const onSubmit = async (data: tProjectUpdateDto) => {
    const { id, ...rest } = project as tProject;
    const dataUpdate = handleDataUpdate<tProjectUpdateDto>(
      data,
      rest as tProjectUpdateDto
    );

    if (dataUpdate.hasntChanges) {
      push({ type: "info", message: "Nada foi alterado." });
      setEditing(false);
      return;
    }

    const newData = dataUpdate.data;
    newData.id = id;

    const res = await updateInformacoes(projectService, newData);

    if (res.statusCode) {
      push({
        type: "error",
        message: "Oops, algo deu errado. Tente novamente mais tarde.",
      });
      setEditing(false);
      return;
    }
    push({ type: "success", message: "Informações alteradas com sucesso! :)" });
    setEditing(false);
  };

  async function findProjetoInfos() {
    const res = await findById(projectService, Number(id));
    setProject(res);
    setDataInicio(formataData(res.dataInicio, "input"));
    setDataFim(formataData(res.dataFim, "input"));
    setDataFinalizado(formataData(res.dataFinalizado));
  }

  async function findEtapa() {
    const res = await findByProjetoEStatus(
      projectService,
      Number(id),
      EtapaStatus.ANDAMENTO
    );
    if (res.etapa === ProjetoEtapa.FINALIZADO) {
      setIsFinalizado(true);
    }
  }

  async function findClientes() {
    const res = await fetchClientes(clienteService);
    setClientes(res);
  }

  useEffect(() => {
    findProjetoInfos();
    findClientes();
    findEtapa();
  }, []);

  return (
    <div className="space-y-4">
      {/* Informações */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center mb-4">
          <div className="ml-auto flex items-center gap-2">
            {!isFinalizado && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1.5 text-sm rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Editar
              </button>
            )}

            {editing && (
              <>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm rounded-md bg-fuchsia-900 text-white hover:bg-fuchsia-700 disabled:opacity-50 cursor-pointer"
                >
                  Salvar
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                  }}
                  className="px-3 py-1.5 text-sm rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-full">
            <label className="block text-sm font-medium mb-1">
              Nome do projeto
            </label>
            <input
              type="text"
              defaultValue={project?.nome}
              {...register("nome")}
              disabled={!editing}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
            />
          </div>
          <div className="sm:col-span-full">
            <label className="block text-sm font-medium mb-1">
              Link dos Arquivos
            </label>
            <input
              type="text"
              {...register("linkArquivos")}
              defaultValue={project?.linkArquivos}
              disabled={!editing}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
            />
          </div>

          <div className="sm:col-span-full">
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <select
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
              {...register("cliente")}
              id="cliente"
              disabled={!editing}
            >
              <option value={project?.cliente.id}>
                {project?.cliente.nome}
              </option>
              {clientes?.map((data, idx) => {
                return (
                  <option key={idx} value={data.id}>
                    {data.nome}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium mb-1">Início</label>

            {
              <input
                type="date"
                defaultValue={dataInicio}
                {...register("dataInicio")}
                disabled={!editing}
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
              />
            }
          </div>

          <div className="sm:col-span-1">
            <label className="block text-sm font-medium mb-1">
              Fim previsto
            </label>
            <input
              type="Date"
              {...register("dataFim")}
              defaultValue={dataFim}
              disabled={!editing}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
            />
          </div>

          <div className="sm:col-span- ">
            <label className="block text-sm font-medium mb-1">Fim real</label>
            <input
              type="text"
              defaultValue={dataFinalizado}
              disabled={true}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
            />
          </div>

          <div className="sm:col-span-full">
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              defaultValue={project?.descricao}
              disabled={!editing}
              {...register("descricao")}
              rows={4}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
