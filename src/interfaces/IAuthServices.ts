import { tUserAuth } from "@/@types/tUser";

export default interface IAuthServices {
  login(userAuth: tUserAuth): Promise<any>;
  storageToken(token: string): void;
  isLogged(): "semtoken" | "expirado" | "valido" | "invalido";
  getUserData(): any;
  getUserId(): number;
  logout(): void;
}
