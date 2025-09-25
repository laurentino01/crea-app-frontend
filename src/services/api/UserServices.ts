import {
  tUser,
  tUserCreateDto,
  tUserListQuery,
  tUserPersisted,
} from "@/@types/tUser";
import { IUserServices } from "@/interfaces/IUserServices";
import { authService } from "./AuthService";

class UserService implements IUserServices {
  private readonly url: string =
    process.env.API_URL ?? "http://localhost:4000/api/v1";
  private readonly token? = `Bearer ${authService.getToken()}`;
  async create(user: tUserCreateDto): Promise<tUser> {
    const res = await fetch(`${this.url}/usuarios`, {
      method: "post",
      headers: {
        Authorization: `${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    return await res.json();
  }
  async findAll(query?: tUserListQuery): Promise<tUser[]> {
    console.log("opa");
    const res = await fetch(`${this.url}/usuarios`, {
      method: "get",
      headers: {
        Authorization: `${this.token}`,
        "Content-Type": "application/json",
      },
    });

    return await res.json();
  }
  async findById(id: string): Promise<tUserPersisted | null> {
    return {} as tUserPersisted;
  }

  async update(
    id: string,
    changes: Partial<Omit<tUserPersisted, "id">>
  ): Promise<tUserPersisted> {
    return {} as tUserPersisted;
  }
}

export const userService = new UserService();
