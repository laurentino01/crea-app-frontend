"use client";

import { useEffect } from "react";
import { seedUsersToLocalStorage } from "@/lib/users.localstorage";
import { seedClientsToLocalStorage } from "@/lib/clients.localstorage";
import { seedProjectsToLocalStorage } from "@/lib/projects.localstorage";
import { seedCriteriosToLocalStorage } from "@/lib/criterios.localstorage";

export function DevMockInitializer() {
  useEffect(() => {
    const auto = process.env.NEXT_PUBLIC_AUTO_SEED_MOCKS === "true";
    const force = process.env.NEXT_PUBLIC_AUTO_SEED_FORCE === "true";
    if (!auto) return;
    // Ordem importa para manter relacionamentos (users/clients -> projects)
    seedUsersToLocalStorage({ force });
    seedClientsToLocalStorage({ force });
    seedProjectsToLocalStorage({ force });
    seedCriteriosToLocalStorage({ force });
  }, []);
  return null;
}

export default DevMockInitializer;

