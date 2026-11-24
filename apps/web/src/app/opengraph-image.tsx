import { ImageResponse } from "next/og";

// Imagem da prévia do link (WhatsApp, redes). É a mesma para todas as páginas,
// então nunca entrega o resultado de ninguém.
export const alt = "Amigo Secreto: sorteio com um link para cada pessoa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CREME = "#f6f0eb";
const VINHO = "#9a3c4c";
const VINHO_ESCURO = "#843744";
const TINTA = "#2c2325";

export default function ImagemDePrevia() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 96px",
          background: CREME,
          color: TINTA,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 88, lineHeight: 1, letterSpacing: -3 }}>
            Amigo Secreto
          </div>
          <div style={{ fontSize: 36, lineHeight: 1.3, maxWidth: 620 }}>
            Sorteio com um link para cada pessoa, que revela só quem ela tirou.
          </div>
        </div>
        <div
          style={{
            position: "relative",
            display: "flex",
            width: 300,
            height: 300,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              bottom: 20,
              height: 150,
              borderRadius: 14,
              background: VINHO,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 20,
              right: 20,
              bottom: 166,
              height: 48,
              borderRadius: 12,
              background: VINHO_ESCURO,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 130,
              width: 40,
              bottom: 20,
              height: 194,
              background: CREME,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 74,
              bottom: 206,
              width: 76,
              height: 56,
              borderRadius: 999,
              border: `12px solid ${VINHO_ESCURO}`,
              transform: "rotate(-18deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 150,
              bottom: 206,
              width: 76,
              height: 56,
              borderRadius: 999,
              border: `12px solid ${VINHO_ESCURO}`,
              transform: "rotate(18deg)",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
