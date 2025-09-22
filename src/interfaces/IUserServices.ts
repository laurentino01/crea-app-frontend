import {
  tUserCreateDto,
  tUserPersisted,
  tUserListQuery,
  tUSer,
} from "../@types/tUser";

export interface IUserServices {
  // Adds a new user record to storage
  create(user: tUserCreateDto): Promise<tUSer>;
  // Returns users based on optional query params
  findAll(query?: tUserListQuery): Promise<tUserPersisted[]>;
  // Returns a single user by id (or null if not found)
  findById(id: string): Promise<tUserPersisted | null>;
  // Updates a user by id with partial changes and returns the updated entity
  update(
    id: string,
    changes: Partial<Omit<tUserPersisted, "id">>
  ): Promise<tUserPersisted>;
}
