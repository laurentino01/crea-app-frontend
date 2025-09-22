import { tUserCreateDto } from "@/@types/tUser";
import { IUserServices } from "@/interfaces/IUserServices";

export async function create(userService: IUserServices, user: tUserCreateDto) {
  return await userService.create(user);
}
