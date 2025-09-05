import {
  Dificuldade,
  TipoCriterio,
  type tCriterioAvaliacao,
  type tPontuacaoProjeto,
} from "@/@types/tAvaliacao";
import type { tIdProjeto, tIdUsuario } from "@/@types/tProject";
import type { IAvaliacaoServices } from "@/interfaces/IAvaliacaoServices";
import type { IPontuacaoServices } from "@/interfaces/IPontuacaoServices";

function makeAggregateCriterio(
  id: string,
  label: string,
  ponto: number,
  tipo: TipoCriterio
): tCriterioAvaliacao {
  return {
    id,
    criterio: label,
    ponto,
    tipoCriterio: tipo,
  } as tCriterioAvaliacao;
}

export async function recomputePontuacao(
  avaliacaoServices: IAvaliacaoServices,
  pontuacaoServices: IPontuacaoServices,
  params: {
    idProjeto: tIdProjeto;
    idUsuario: tIdUsuario;
    dificuldade: Dificuldade;
  }
): Promise<tPontuacaoProjeto> {
  const { idProjeto, idUsuario, dificuldade } = params;
  const avals = await avaliacaoServices.listByProjetoUsuario(
    idProjeto,
    idUsuario
  );

  // Soma separados por tipo
  const sumPositivos = avals
    .filter((a) => a.idCriterio.tipoCriterio === TipoCriterio.Positivo)
    .reduce((acc, a) => acc + (a.idCriterio?.ponto ?? 0), 0);
  const sumAdvertencias = avals
    .filter((a) => a.idCriterio.tipoCriterio === TipoCriterio.Advertencia)
    .reduce((acc, a) => acc + (a.idCriterio?.ponto ?? 0), 0);

  const positivosAgg = makeAggregateCriterio(
    `agg-positivo-${idProjeto}-${idUsuario}`,
    "Soma de positivos",
    sumPositivos,
    TipoCriterio.Positivo
  );
  const advertenciaAgg = makeAggregateCriterio(
    `agg-advertencia-${idProjeto}-${idUsuario}`,
    "Soma de advertências",
    sumAdvertencias,
    TipoCriterio.Advertencia
  );

  const base = sumPositivos - sumAdvertencias;
  const total = Math.max(0, base * Number(dificuldade));

  const registro: tPontuacaoProjeto = {
    idUsuario,
    idProjeto,
    positivos: positivosAgg,
    advertencia: advertenciaAgg,
    dificuldade,
    pontuacao: total,
  } as tPontuacaoProjeto;

  await pontuacaoServices.upsert(registro);
  return registro;
}

