import { tClientListQuery, tClientPersisted } from "../@types/tClient";
import { IClientServices } from "../interfaces/IClientServices";

export async function fetchClients(
  clientServices: IClientServices,
  query?: tClientListQuery
): Promise<tClientPersisted[]> {
  return clientServices.findAll(query);
}

