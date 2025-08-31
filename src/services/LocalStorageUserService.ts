import { tUserCreateDto, tUserPersisted } from "../@types/tUser";
import { IUserServices } from "../interfaces/IUserServices";

const STORAGE_KEY = "users";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function getStoredUsers(): tUserPersisted[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as any[];
    return Array.isArray(parsed) ? (parsed as tUserPersisted[]) : [];
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
    current.push(persist);
    setStoredUsers(current);
  }
}

// Convenient default instance
export const userService = new LocalStorageUserService();
