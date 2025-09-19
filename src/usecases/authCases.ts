import { tUserAuth } from "@/@types/tUser";
import IAuthServices from "@/interfaces/IAuthServices";

export async function loginUser(
  authServices: IAuthServices,
  userAuth: tUserAuth
): Promise<any> {
  return await authServices.login(userAuth);
}

export function storageToken(authServices: IAuthServices, token: string): void {
  authServices.storageToken(token);
}
export function isLogged(authServices: IAuthServices): boolean {
  return authServices.isLogged();
}
export function getUserData(authServices: IAuthServices): any {
  return authServices.getUserData();
}
