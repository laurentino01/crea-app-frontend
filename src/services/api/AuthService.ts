import { tUserAuth } from "@/@types/tUser";
import IAuthServices from "@/interfaces/IAuthServices";

class AuthService implements IAuthServices {
  private readonly url: string =
    process.env.API_URL ?? "http://localhost:4000/api/v1";

  async login(userAuth: tUserAuth): Promise<any> {
    const res = await fetch(`${this.url}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userAuth),
    });
    const data = await res.json();
    return data;
  }

  storageToken() {}

  getToken() {}

  logout() {}

  getUserId() {}

  getUserRole() {}

  getUserData() {}

  /** Valida se está logado */
  isLogged() {}

  // Valida se é adm
  isAdm() {}
}

export const authService = new AuthService();
