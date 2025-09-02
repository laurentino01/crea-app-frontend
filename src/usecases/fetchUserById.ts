import { tUserPersisted } from "../@types/tUser";
import { IUserServices } from "../interfaces/IUserServices";

export async function fetchUserById(
  userServices: IUserServices,
  id: string
): Promise<tUserPersisted | null> {
  return userServices.findById(id);
}

