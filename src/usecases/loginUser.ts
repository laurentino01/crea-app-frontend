import { tUserAuth } from "@/@types/tUser";
import IAuthServices from "@/interfaces/IAuthServices";

export async function loginUser(
  authServices: IAuthServices,
  userAuth: tUserAuth
): Promise<any> {
  return await authServices.login(userAuth);
}
