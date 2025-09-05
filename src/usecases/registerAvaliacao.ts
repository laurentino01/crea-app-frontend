import type { tAvaliacaoProjeto } from "@/@types/tAvaliacao";
import type { IAvaliacaoServices } from "@/interfaces/IAvaliacaoServices";

export async function registerAvaliacao(
  avaliacaoServices: IAvaliacaoServices,
  avaliacao: tAvaliacaoProjeto
): Promise<void> {
  // Apenas delega ao service; regras de validação podem ser adicionadas depois
  await avaliacaoServices.add(avaliacao);
}

