import { tUserAuth } from "@/@types/tUser";

export default interface IAuthServices {
  login(userAuth: tUserAuth): Promise<any>;
}
