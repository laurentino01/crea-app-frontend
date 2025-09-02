import { tClientCreateDto, tClientListQuery, tClientPersisted } from "../@types/tClient";

export interface IClientServices {
  // Adds a new client record to storage
  create(client: tClientCreateDto): Promise<void>;
  // Returns clients based on optional query params
  findAll(query?: tClientListQuery): Promise<tClientPersisted[]>;
  // Returns a single client by id (or null if not found)
  findById(id: string): Promise<tClientPersisted | null>;
  // Updates a client by id with partial changes and returns the updated entity
  update(
    id: string,
    changes: Partial<Omit<tClientPersisted, "id">>
  ): Promise<tClientPersisted>;
}

