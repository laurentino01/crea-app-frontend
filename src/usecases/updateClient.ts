import { tClientPersisted } from "../@types/tClient";
import { IClientServices } from "../interfaces/IClientServices";

export async function updateClient(
  clientServices: IClientServices,
  id: string,
  changes: Partial<Omit<tClientPersisted, "id">>
): Promise<tClientPersisted> {
  return clientServices.update(id, changes);
}

