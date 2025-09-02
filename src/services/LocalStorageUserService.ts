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
      if (!(u as any).id) {
        mutated = true;
        return { id: generateId(), ...(u as object) } as tUserPersisted;
      }
      return u as tUserPersisted;
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
    const newUser: tUserPersisted = { id: generateId(), ...persist } as tUserPersisted;
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
}

// Convenient default instance
export const userService = new LocalStorageUserService();
