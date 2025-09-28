import {
  tUserCreateDto,
  tUserPersisted,
  tUserListQuery,
  tUser,
  tUserUpdateDto,
  tResUpdate,
} from "../@types/tUser";

export interface IUserServices {
  // Adds a new user record to storage
  create(user: tUserCreateDto): Promise<tUser>;
  // Returns users based on optional query params
  findAll(query?: tUserListQuery): Promise<tUser[]>;
  // Returns a single user by id (or null if not found)
  findById(id: string): Promise<tUser | null>;
  // Updates a user by id with partial changes and returns the updated entity
  update(changes: tUserUpdateDto): Promise<tResUpdate>;
}
