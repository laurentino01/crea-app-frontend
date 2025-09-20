import { tUserAuth, tUserSession } from "@/@types/tUser";
import IAuthServices from "@/interfaces/IAuthServices";
import { jwtDecode } from "jwt-decode";

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

  async storageToken(token: string) {
    if (window === undefined) {
      return;
    }
    localStorage.setItem("token", token);
  }

  getToken() {
    return localStorage.getItem("token");
  }

  logout() {
    if (window === undefined) {
      return;
    }
    localStorage.removeItem("token");
  }

  getUserId() {}

  getUserRole() {}

  getUserData() {
    if (window === undefined) {
      return;
    }

    const token = localStorage.getItem("token");
    if (token) {
      return jwtDecode<tUserSession>(token);
    }
  }

  /** Valida se está logado */
  isLogged() {
    if (window === undefined) {
      return false;
    }

    return !!localStorage.getItem("token");
  }

  // Valida se é adm
  isAdm() {}
}

export const authService = new AuthService();
