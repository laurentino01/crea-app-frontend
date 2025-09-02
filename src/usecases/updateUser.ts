import { tUserPersisted } from "../@types/tUser";
import { IUserServices } from "../interfaces/IUserServices";

export async function updateUser(
  userServices: IUserServices,
  id: string,
  changes: Partial<Omit<tUserPersisted, "id">>
): Promise<tUserPersisted> {
  return userServices.update(id, changes);
}

