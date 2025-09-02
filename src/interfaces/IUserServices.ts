import { tUserCreateDto, tUserPersisted, tUserListQuery } from "../@types/tUser";

export interface IUserServices {
  // Adds a new user record to storage
  create(user: tUserCreateDto): Promise<void>;
  // Returns users based on optional query params
  findAll(query?: tUserListQuery): Promise<tUserPersisted[]>;
}
