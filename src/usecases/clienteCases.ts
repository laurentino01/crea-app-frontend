import {
  tClientCreateDto,
  tClienteCategoria,
  tClienteCategoriaCreateDto,
} from "@/@types/tClient";
import { IClientServices } from "@/interfaces/IClientServices";

export async function createCategoria(
  clienteService: IClientServices,
  categoriaDto: tClienteCategoriaCreateDto
) {
  return await clienteService.createCategoria(categoriaDto);
}

export async function create(
  clienteService: IClientServices,
  cliente: tClientCreateDto
) {
  return await clienteService.create(cliente);
}

export async function findAllCategorias(
  clienteService: IClientServices
): Promise<tClienteCategoria[]> {
  return await clienteService.findAllCategorias();
}
