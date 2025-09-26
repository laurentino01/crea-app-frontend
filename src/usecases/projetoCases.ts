import { tProjectCreateDto } from "@/@types/tProject";
import { IProjectServices } from "@/interfaces/IProjectServices";

export async function create(
  projectService: IProjectServices,
  projectCreateDto: tProjectCreateDto
) {
  return await projectService.create(projectCreateDto);
}
