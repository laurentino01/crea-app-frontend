import { tUserListQuery, tUserPersisted } from "../@types/tUser";
import { IUserServices } from "../interfaces/IUserServices";

export async function fetchUsers(
  userServices: IUserServices,
  query?: tUserListQuery
): Promise<tUserPersisted[]> {
  return userServices.findAll(query);
}

