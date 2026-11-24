import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';

/**
 * Lacre dos links de revelação.
 *
 * Como a aplicação não tem banco de dados, o resultado de cada participante
 * viaja dentro do próprio link, criptografado com AES-256-GCM. Só a API tem
 * a chave: o front e quem recebe o link não conseguem ler nem alterar o
 * conteúdo (o GCM detecta qualquer alteração).
 *
 * Formato do token (base64url): iv (12 bytes) + tag (16 bytes) + dados.
 */

export interface DadosRevelacao {
  grupo: string;
  participante: string;
  amigoSecreto: string;
  valorSugerido?: string;
  dataEvento?: string;
}

/** Chaves curtas para o link não ficar enorme. */
interface Conteudo {
  g: string;
  p: string;
  a: string;
  v?: string;
  d?: string;
}

export const TAMANHO_MINIMO_SEGREDO = 16;

const ALGORITMO = 'aes-256-gcm';
const TAMANHO_IV = 12;
const TAMANHO_TAG = 16;

export class LinkInvalidoError extends Error {
  override name = 'LinkInvalidoError';
}

export class Lacre {
  private readonly chave: Buffer;

  constructor(segredo: string) {
    if (!segredo || segredo.length < TAMANHO_MINIMO_SEGREDO) {
      throw new Error(
        `O segredo dos links precisa ter pelo menos ${TAMANHO_MINIMO_SEGREDO} caracteres.`,
      );
    }
    // Deriva uma chave de 32 bytes a partir do segredo configurado.
    this.chave = createHash('sha256').update(segredo).digest();
  }

  lacrar(dados: DadosRevelacao): string {
    const conteudo: Conteudo = {
      g: dados.grupo,
      p: dados.participante,
      a: dados.amigoSecreto,
      ...(dados.valorSugerido ? { v: dados.valorSugerido } : {}),
      ...(dados.dataEvento ? { d: dados.dataEvento } : {}),
    };

    const iv = randomBytes(TAMANHO_IV);
    const cifra = createCipheriv(ALGORITMO, this.chave, iv);
    const cifrado = Buffer.concat([
      cifra.update(JSON.stringify(conteudo), 'utf8'),
      cifra.final(),
    ]);
    const tag = cifra.getAuthTag();

    return Buffer.concat([iv, tag, cifrado]).toString('base64url');
  }

  abrir(token: string): DadosRevelacao {
    try {
      const bytes = Buffer.from(token, 'base64url');
      if (bytes.length <= TAMANHO_IV + TAMANHO_TAG) {
        throw new Error('token curto demais');
      }

      const iv = bytes.subarray(0, TAMANHO_IV);
      const tag = bytes.subarray(TAMANHO_IV, TAMANHO_IV + TAMANHO_TAG);
      const cifrado = bytes.subarray(TAMANHO_IV + TAMANHO_TAG);

      const decifra = createDecipheriv(ALGORITMO, this.chave, iv);
      decifra.setAuthTag(tag);
      const texto = Buffer.concat([
        decifra.update(cifrado),
        decifra.final(),
      ]).toString('utf8');

      const conteudo = JSON.parse(texto) as Partial<Conteudo>;
      if (
        typeof conteudo.g !== 'string' ||
        typeof conteudo.p !== 'string' ||
        typeof conteudo.a !== 'string'
      ) {
        throw new Error('conteúdo incompleto');
      }

      return {
        grupo: conteudo.g,
        participante: conteudo.p,
        amigoSecreto: conteudo.a,
        ...(conteudo.v ? { valorSugerido: conteudo.v } : {}),
        ...(conteudo.d ? { dataEvento: conteudo.d } : {}),
      };
    } catch {
      throw new LinkInvalidoError(
        'Link inválido ou alterado. Peça um novo link a quem organizou o sorteio.',
      );
    }
  }
}
