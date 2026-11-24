/** Funções puras de texto usadas pelas telas. */

export function normalizarNome(nome: string): string {
  return nome.trim().replace(/\s+/g, " ");
}

export function mesmoNome(a: string, b: string): boolean {
  return (
    normalizarNome(a).toLocaleLowerCase("pt-BR") ===
    normalizarNome(b).toLocaleLowerCase("pt-BR")
  );
}

export function linkDeRevelacao(origem: string, token: string): string {
  return `${origem}/revelar/${token}`;
}

/** Link do WhatsApp com a mensagem pronta (o usuário escolhe o contato). */
export function linkDoWhatsApp(
  participante: string,
  grupo: string,
  link: string,
): string {
  const mensagem =
    `Oi, ${participante}! Seu amigo secreto do grupo "${grupo}" já foi sorteado. ` +
    `Abra este link para descobrir quem você tirou (ele é só seu): ${link}`;
  return `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
}

/** "2026-12-24" -> "24 de dezembro de 2026" (sem depender do fuso do aparelho). */
export function formatarData(dataIso: string): string {
  const data = new Date(`${dataIso}T12:00:00Z`);
  if (Number.isNaN(data.getTime())) return dataIso;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(data);
}
