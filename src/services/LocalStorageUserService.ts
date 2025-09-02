import { tUserCreateDto, tUserPersisted, tUserListQuery } from "../@types/tUser";
import { IUserServices } from "../interfaces/IUserServices";

const STORAGE_KEY = "users";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function generateId(): string {
  // Simple unique id: timestamp + random segment
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  ).toUpperCase();
}

function getStoredUsers(): tUserPersisted[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as any[];
    if (!Array.isArray(parsed)) return [];

    // Migrate: ensure each user has an id
    let mutated = false;
    const withIds = parsed.map((u) => {
      let next = u as any;
      if (!next.id) {
        mutated = true;
        next = { id: generateId(), ...(u as object) } as tUserPersisted;
      }
      // Ensure "ativo" exists; default to true for legacy records
      if (typeof next.ativo === "undefined") {
        mutated = true;
        next = { ...next, ativo: true };
      }
      return next as tUserPersisted;
    });

    if (mutated) {
      setStoredUsers(withIds);
    }

    return withIds as tUserPersisted[];
  } catch {
    return [];
  }
}

function setStoredUsers(users: tUserPersisted[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export class LocalStorageUserService implements IUserServices {
  async create(user: tUserCreateDto): Promise<void> {
    const { senhaConfirm, ...persist } = user;
    const current = getStoredUsers();
    const newUser: tUserPersisted = {
      id: generateId(),
      // Persist all fields from DTO (including ativo)
      ...persist,
    } as tUserPersisted;
    current.push(newUser);
    setStoredUsers(current);
  }

  async findAll(query?: tUserListQuery): Promise<tUserPersisted[]> {
    const raw = getStoredUsers();
    // Normalize date field back to Date instance if it exists as string
    const normalized = raw.map((u) => {
      const maybeDate = (u as any).dataNascimento as any;
      return {
        ...u,
        dataNascimento:
          maybeDate ? new Date(maybeDate as unknown as string) : undefined,
        ativo: (u as any).ativo ?? true,
      } as tUserPersisted;
    });
    if (!query) return normalized;

    const { search, isAdm } = query;

    let filtered = normalized;

    if (typeof isAdm === "boolean") {
      filtered = filtered.filter((u) => u.isAdm === isAdm);
    }

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter((u) => {
        const nome = u.nomeCompleto?.toLowerCase() ?? "";
        const apelido = u.apelido?.toLowerCase() ?? "";
        const email = (u as any).email?.toLowerCase?.() ?? "";
        return (
          nome.includes(term) || apelido.includes(term) || email.includes(term)
        );
      });
    }

    return filtered;
  }

  async findById(id: string): Promise<tUserPersisted | null> {
    const all = getStoredUsers();
    const found = all.find((u) => u.id === id);
    if (!found) return null;
    const maybeDate = (found as any).dataNascimento as any;
    return {
      ...found,
      dataNascimento: maybeDate ? new Date(maybeDate as unknown as string) : undefined,
    } as tUserPersisted;
  }

  async update(
    id: string,
    changes: Partial<Omit<tUserPersisted, "id">>
  ): Promise<tUserPersisted> {
    const all = getStoredUsers();
    const idx = all.findIndex((u) => u.id === id);
    if (idx === -1) {
      throw new Error("User not found");
    }

    const updated: tUserPersisted = {
      ...all[idx],
      ...changes,
      id,
    } as tUserPersisted;

    all[idx] = updated;
    setStoredUsers(all);

    const maybeDate = (updated as any).dataNascimento as any;
    return {
      ...updated,
      dataNascimento: maybeDate ? new Date(maybeDate as unknown as string) : undefined,
    } as tUserPersisted;
  }
}

// Convenient default instance
export const userService = new LocalStorageUserService();
