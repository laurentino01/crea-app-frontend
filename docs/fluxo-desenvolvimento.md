# Fluxo de Desenvolvimento — Guia Prático

Este guia descreve o fluxo de desenvolvimento recomendado neste projeto, com uma visão das camadas (types → interfaces → services → use cases → UI) e um exemplo prático, passo a passo, de como implementar uma nova funcionalidade.

## Visão Geral das Camadas

- Tipos (src/@types): Modelos de dados e enums. Ex.: `tProjectPersisted`, `ProjetoEtapa`.
- Interfaces (src/interfaces): Contratos que os services devem cumprir. Ex.: `IProjectServices`.
- Services (src/services): Implementações concretas (aqui, LocalStorage). Ex.: `LocalStorageProjectService`.
- Use Cases (src/usecases): Funções finas que orquestram chamadas aos services. Ex.: `fetchProjects`, `updateProject`, `changeProjectEtapa`.
- UI (src/app, src/components): Páginas e componentes que consomem os use cases.
- Lib/Mocks (src/lib): Seeds e utilitários de dados para desenvolvimento local. Ex.: `projects.localstorage.ts`.

Convenções úteis observadas no repositório:
- `tFooCreateDto` vs `tFooPersisted` e consultas `tFooListQuery`.
- Services expõem CRUD e operações específicas (ex.: `changeEtapa`, `setProjetoConcluido`).
- Use cases são funções puras/finas, recebem a interface do service por injeção.
- UI usa instâncias concretas dos services (ex.: `projectService`) com os use cases.
- Eventos de atualização: services disparam `window.dispatchEvent(new CustomEvent("project-updated", {detail:{id}}))` após mutações de projeto.

---

## Exemplo: “Favoritar Projeto” (end‑to‑end)

Objetivo: permitir marcar/desmarcar um projeto como favorito (`isFavorito`) e exibir na UI um botão de favorito na página de detalhes do projeto.

Abaixo segue um caminho simples (utilizando o método `update`) e, a seguir, uma opção com método específico.

### 1) Types — adicionar campo

Arquivo: `src/@types/tProject.ts`

- Adicione um novo campo opcional a `tProjectCreateDto` e `tProjectPersisted` via herança do primeiro.

```ts
export type tProjectCreateDto = {
  // ...campos existentes
  isFavorito?: boolean; // novo
};

// tProjectPersisted já é { id } & tProjectCreateDto, então herdará isFavorito
```

Observação: por padrão, `isFavorito` pode ser `false`/`undefined`.

### 2) Interfaces — (opção mínima) manter apenas `update`

Arquivo: `src/interfaces/IProjectServices.ts`

- Nada obrigatório, pois já existe `update(id, changes)`.
- Opcionalmente, você pode documentar o novo campo no comentário do tipo.

Alternativa (mais explícita): adicionar método dedicado:

```ts
// Opcional
toggleFavorito(projectId: string, value: boolean): Promise<tProjectPersisted>;
```

### 3) Services — persistência do campo

Arquivo: `src/services/LocalStorageProjectService.ts`

- Se seguir a opção mínima, nada a mudar: o `update` já mescla `changes` e persiste.
- Se optar pelo método dedicado, implemente-o assim:

```ts
async toggleFavorito(projectId: string, value: boolean): Promise<tProjectPersisted> {
  const all = getStoredProjects();
  const idx = all.findIndex((p) => p.id === projectId);
  if (idx === -1) throw new Error("Project not found");
  const updated = { ...all[idx], isFavorito: value } as tProjectPersisted;
  all[idx] = updated;
  setStoredProjects(all);
  broadcastProjectUpdated(projectId);
  return updated;
}
```

Opcional (seed): atualizar `src/lib/projects.localstorage.ts` para incluir `isFavorito` em alguns mocks e facilitar os testes.

### 4) Use Case — função fina

Arquivo (novo): `src/usecases/toggleProjectFavorito.ts`

- Implementação usando a opção mínima via `update`:

```ts
import { IProjectServices } from "@/interfaces/IProjectServices";
import { tProjectPersisted } from "@/@types/tProject";

export async function toggleProjectFavorito(
  projectServices: IProjectServices,
  id: string,
  value: boolean
): Promise<tProjectPersisted> {
  return projectServices.update(id, { isFavorito: value });
}
```

- Se tiver criado o método dedicado no service/interface, basta chamar `projectServices.toggleFavorito(id, value)` aqui.

### 5) UI — botão na página de detalhes

Arquivo: `src/app/projetos/[id]/page.tsx`

- Exemplo de adição de um botão “Favoritar/Desfavoritar” usando o use case:

```tsx
"use client";
// ... imports existentes
import { toggleProjectFavorito } from "@/usecases/toggleProjectFavorito";
import { projectService } from "@/services/LocalStorageProjectService";

export default function ProjetoDetalhesPage() {
  // ... estado e efeitos existentes

  async function handleToggleFavorito() {
    if (!project) return;
    const next = !(project as any).isFavorito;
    const updated = await toggleProjectFavorito(projectService, project.id, next);
    setProject(updated);
  }

  // ... dentro do JSX, próximo aos botões de Editar/Salvar
  // <button onClick={handleToggleFavorito}> {project?.isFavorito ? "Desfavoritar" : "Favoritar"} </button>
}
```

Dicas:
- Mantenha feedback visual simples (ex.: texto do botão alternando, ícone de estrela cheio/vazio, etc.).
- Se necessário, reaja ao evento `project-updated` (caso a página não seja a origem da alteração) para sincronizar estados em múltiplas telas.

### 6) Seeds/Migração (opcional)

Arquivo: `src/lib/projects.localstorage.ts`

- Inclua `isFavorito` em alguns itens do array `PROJECTS_DEFAULT` para ver a UI inicial já variada:

```ts
{ id: "PRJ-...", /* ... */ isFavorito: true }
```

- Caso queira limpar e reseedar, use o `DevMockInitializer` com `NEXT_PUBLIC_AUTO_SEED_FORCE=true` em `.env.local`.

### 7) Checklist de Verificação Rápida

- Types: `isFavorito` adicionado a `tProjectCreateDto` (e herdado em `tProjectPersisted`).
- Service: atualização persiste e emite evento `project-updated` (se aplicável).
- Use case: `toggleProjectFavorito` criado e exportado.
- UI: botão de favorito presente e funcional na página do projeto.
- Seeds: (opcional) mocks com `isFavorito` para testes visuais.

---

## Boas Práticas Gerais

- Tipagem primeiro: adicione tipos e DTOs antes de services/UI para guiar o design.
- Interfaces claras: prefira declarar capacidades em `src/interfaces` e implementar em `src/services`.
- Use cases finos: sem lógica de apresentação; retornam dados tipados e tratam apenas a orquestração com services.
- UI reativa: isole estado local, trate loading/erro e reflita as mutações imediatamente.
- Persistência local: ao salvar, os services já notificam via `project-updated`; use se precisar sincronizar outras telas.
- Nomes consistentes: siga o padrão dos use cases existentes (`fetchX`, `updateX`, `changeY`, `registerZ`, etc.).
- Evolução segura: comece usando `update` para campos simples; introduza métodos específicos quando regras de negócio crescerem.

## Dúvidas ou próximos passos

Se quiser, posso abrir o PR inicial desta feature “Favoritar Projeto” adicionando os arquivos e hooks na UI. Também posso incluir exemplos de testes manuais ou um pequeno badge de favorito na listagem de projetos.

