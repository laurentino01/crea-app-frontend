import { tClientPersisted } from "../@types/tClient";
import { IClientServices } from "../interfaces/IClientServices";

export async function fetchClientById(
  clientServices: IClientServices,
  id: string
): Promise<tClientPersisted | null> {
  return clientServices.findById(id);
}

