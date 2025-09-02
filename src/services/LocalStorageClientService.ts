import { tClientCreateDto, tClientListQuery, tClientPersisted } from "../@types/tClient";
import { IClientServices } from "../interfaces/IClientServices";

const STORAGE_KEY = "clients";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function generateId(): string {
  // Simple unique id: timestamp + random segment
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  ).toUpperCase();
}

function getStoredClients(): tClientPersisted[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as any[];
    if (!Array.isArray(parsed)) return [];

    let mutated = false;
    const withIds = parsed.map((c) => {
      let next = c as any;
      if (!next.id) {
        mutated = true;
        next = { id: generateId(), ...(c as object) } as tClientPersisted;
      }
      if (typeof next.ativo === "undefined") {
        mutated = true;
        next = { ...next, ativo: true };
      }
      return next as tClientPersisted;
    });

    if (mutated) {
      setStoredClients(withIds);
    }

    return withIds as tClientPersisted[];
  } catch {
    return [];
  }
}

function setStoredClients(clients: tClientPersisted[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export class LocalStorageClientService implements IClientServices {
  async create(client: tClientCreateDto): Promise<void> {
    const current = getStoredClients();
    const newClient: tClientPersisted = {
      id: generateId(),
      ...client,
    } as tClientPersisted;
    current.push(newClient);
    setStoredClients(current);
  }

  async findAll(query?: tClientListQuery): Promise<tClientPersisted[]> {
    const all = getStoredClients();
    if (!query) return all;

    const { search, categoria, ativo } = query;
    let filtered = all;

    if (typeof ativo === "boolean") {
      filtered = filtered.filter((c) => c.ativo === ativo);
    }

    if (categoria && categoria.trim()) {
      const cat = categoria.trim().toLowerCase();
      filtered = filtered.filter(
        (c) => (c.categoria ?? "").toLowerCase() === cat
      );
    }

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter((c) => {
        const nome = c.nome?.toLowerCase() ?? "";
        const email = c.email?.toLowerCase() ?? "";
        const descricao = c.descricao?.toLowerCase() ?? "";
        return (
          nome.includes(term) || email.includes(term) || descricao.includes(term)
        );
      });
    }

    return filtered;
  }

  async findById(id: string): Promise<tClientPersisted | null> {
    const all = getStoredClients();
    const found = all.find((c) => c.id === id);
    return found ?? null;
  }

  async update(
    id: string,
    changes: Partial<Omit<tClientPersisted, "id">>
  ): Promise<tClientPersisted> {
    const all = getStoredClients();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error("Client not found");
    }

    const updated: tClientPersisted = {
      ...all[idx],
      ...changes,
      id,
    } as tClientPersisted;

    all[idx] = updated;
    setStoredClients(all);
    return updated;
  }
}

// Convenient default instance
export const clientService = new LocalStorageClientService();

