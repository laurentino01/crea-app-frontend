import { tUserCreateDto } from "../@types/tUser";

export interface IUserServices {
  // Adds a new user record to storage
  create(user: tUserCreateDto): Promise<void>;
}
