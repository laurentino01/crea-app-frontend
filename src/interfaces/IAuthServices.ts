import { tUserAuth } from "@/@types/tUser";

export default interface IAuthServices {
  login(userAuth: tUserAuth): Promise<any>;
  storageToken(token: string): void;
  isLogged(): boolean;
  getUserData(): any;
}
