import {
  tClientCreateDto,
  tCliente,
  tClienteCategoria,
  tClienteCategoriaCreateDto,
  tClientListQuery,
  tClientPersisted,
} from "../@types/tClient";

export interface IClientServices {
  // Adds a new client record to storage
  create(client: tClientCreateDto): Promise<tCliente>;
  // Adds new Categoria
  createCategoria(
    client: tClienteCategoriaCreateDto
  ): Promise<tClienteCategoria>;
  // Returns categorias
  findAllCategorias(): Promise<tClienteCategoria[]>;
  // Returns clients based on optional query params
  findAll(query?: tClientListQuery): Promise<tCliente[]>;
  // Returns a single client by id (or null if not found)
  findById(id: string): Promise<tClientPersisted | null>;
  // Updates a client by id with partial changes and returns the updated entity
  update(
    id: string,
    changes: Partial<Omit<tClientPersisted, "id">>
  ): Promise<tClientPersisted>;
}
