import { tProjectCreateDto } from "@/@types/tProject";
import { IProjectServices } from "@/interfaces/IProjectServices";
import { authService } from "./AuthService";

class ProjetoService implements IProjectServices {
  private readonly url: string =
    process.env.API_URL ?? "http://localhost:4000/api/v1";
  private readonly token? = `Bearer ${authService.getToken()}`;

  async create(project: tProjectCreateDto): Promise<{ id: number }> {
    const res = await fetch(`${this.url}/projetos`, {
      method: "post",
      headers: {
        Authorization: `${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(project),
    });

    return await res.json();
  }
}

export const projectService = new ProjetoService();
