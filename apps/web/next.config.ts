import type { NextConfig } from "next";

// Endereço da API NestJS. No deploy, o pipeline informa a URL publicada.
const apiUrl = (process.env.API_URL ?? "http://localhost:3001").replace(
  /\/+$/,
  "",
);

const nextConfig: NextConfig = {
  // O navegador chama /api/... no mesmo domínio do site e o Next repassa
  // para a API. Assim não há CORS e a URL da API fica num lugar só.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiUrl}/:path*` }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
