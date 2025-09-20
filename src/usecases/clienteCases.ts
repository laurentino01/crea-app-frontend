import { tClienteCategoriaCreateDto } from "@/@types/tClient";
import { IClientServices } from "@/interfaces/IClientServices";

export async function createCategoria(
  clienteService: IClientServices,
  categoriaDto: tClienteCategoriaCreateDto
) {
  return await clienteService.createCategoria(categoriaDto);
}
