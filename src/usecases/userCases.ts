import {
  tResUpdate,
  tUser,
  tUserCreateDto,
  tUserListQuery,
  tUserUpdateDto,
} from "@/@types/tUser";
import { IUserServices } from "@/interfaces/IUserServices";

export async function create(userService: IUserServices, user: tUserCreateDto) {
  return await userService.create(user);
}

export async function fetchUsers(
  userServices: IUserServices,
  query?: tUserListQuery
): Promise<tUser[]> {
  return userServices.findAll(query);
}
export async function fetchOne(
  userServices: IUserServices,
  id: number
): Promise<tUser | null> {
  return userServices.findById(String(id));
}

export async function update(
  userServices: IUserServices,
  changes: tUserUpdateDto
): Promise<tResUpdate> {
  return await userServices.update(changes);
}
