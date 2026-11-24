/** Chamadas à API do sorteio (repassadas pelo Next em /api). */

export type Restricao = [string, string];

export interface PedidoDeSorteio {
  grupo: string;
  valorSugerido?: string;
  dataEvento?: string;
  participantes: string[];
  restricoes: Restricao[];
}

export interface LinkDoParticipante {
  participante: string;
  token: string;
}

export interface ResultadoDoSorteio {
  grupo: string;
  links: LinkDoParticipante[];
}

export interface Revelacao {
  grupo: string;
  participante: string;
  amigoSecreto: string;
  valorSugerido?: string;
  dataEvento?: string;
}

const ERRO_DE_CONEXAO =
  "Não foi possível falar com o servidor. Confira sua internet e tente de novo.";

export class ErroDaApi extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ErroDaApi";
  }
}

async function chamar<T>(caminho: string, opcoes?: RequestInit): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`/api${caminho}`, {
      ...opcoes,
      headers: { "content-type": "application/json", ...opcoes?.headers },
      cache: "no-store",
    });
  } catch {
    throw new ErroDaApi(ERRO_DE_CONEXAO, 0);
  }

  const corpo: unknown = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    const mensagem =
      corpo && typeof corpo === "object" && "message" in corpo
        ? String(corpo.message)
        : ERRO_DE_CONEXAO;
    throw new ErroDaApi(mensagem, resposta.status);
  }
  return corpo as T;
}

export function criarSorteio(
  pedido: PedidoDeSorteio,
): Promise<ResultadoDoSorteio> {
  return chamar("/sorteios", { method: "POST", body: JSON.stringify(pedido) });
}

export function buscarRevelacao(token: string): Promise<Revelacao> {
  return chamar(`/revelacoes/${encodeURIComponent(token)}`);
}
