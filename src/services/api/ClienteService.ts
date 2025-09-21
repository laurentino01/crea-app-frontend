import {
  tClientCreateDto,
  tCliente,
  tClienteCategoria,
  tClienteCategoriaCreateDto,
  tClientListQuery,
  tClientPersisted,
} from "@/@types/tClient";
import { IClientServices } from "@/interfaces/IClientServices";
import { authService } from "./AuthService";

class ClienteService implements IClientServices {
  private readonly url: string =
    process.env.API_URL ?? "http://localhost:4000/api/v1";
  private readonly token? = `Bearer ${authService.getToken()}`;

  async create(cliente: tClientCreateDto): Promise<tCliente> {
    const res = await fetch(`${this.url}/clientes`, {
      method: "post",
      headers: {
        Authorization: `${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cliente),
    });

    return await res.json();
  }

  async createCategoria(
    categoria: tClienteCategoriaCreateDto
  ): Promise<tClienteCategoria> {
    const res = await fetch(`${this.url}/categorias`, {
      method: "post",
      headers: {
        Authorization: `${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoria),
    });

    return await res.json();
  }

  async findAllCategorias(): Promise<tClienteCategoria[]> {
    const res = await fetch(`${this.url}/categorias`, {
      method: "get",
      headers: {
        Authorization: `${this.token}`,
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  }

  async findAll(query?: tClientListQuery): Promise<tClientPersisted[]> {
    return [] as tClientPersisted[];
  }

  async findById(id: string): Promise<tClientPersisted | null> {
    return null;
  }

  async update(
    id: string,
    changes: Partial<Omit<tClientPersisted, "id">>
  ): Promise<tClientPersisted> {
    return {} as tClientPersisted;
  }
}

export const clienteService = new ClienteService();
