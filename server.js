const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// URL RAW da sua lista M3U no GitHub.
// Exemplo:
// https://raw.githubusercontent.com/USUARIO/REPOSITORIO/main/lista.m3u
const M3U_SOURCE_URL = process.env.M3U_SOURCE_URL;

const CACHE_SECONDS = Number(process.env.CACHE_SECONDS || 300);

let cachedM3U = null;
let cachedAt = 0;

async function getM3U() {
  if (!M3U_SOURCE_URL) {
    throw new Error("M3U_SOURCE_URL não configurada.");
  }

  const now = Date.now();

  if (cachedM3U && (now - cachedAt) < CACHE_SECONDS * 1000) {
    return cachedM3U;
  }

  const response = await fetch(M3U_SOURCE_URL, {
    headers: {
      "User-Agent": "M3U-Server/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub respondeu HTTP ${response.status}`);
  }

  const text = await response.text();

  if (!text.trim().startsWith("#EXTM3U")) {
    console.warn("Aviso: o conteúdo recebido não começa com #EXTM3U.");
  }

  cachedM3U = text;
  cachedAt = now;

  return text;
}

app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "M3U Server",
    endpoints: {
      playlist: "/lista.m3u",
      health: "/health"
    }
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    sourceConfigured: Boolean(M3U_SOURCE_URL),
    cacheSeconds: CACHE_SECONDS,
    cached: Boolean(cachedM3U)
  });
});

app.get("/lista.m3u", async (req, res) => {
  try {
    const playlist = await getM3U();

    res.setHeader("Content-Type", "audio/x-mpegurl; charset=utf-8");
    res.setHeader("Content-Disposition", 'inline; filename="lista.m3u"');
    res.setHeader("Cache-Control", "no-cache");

    res.send(playlist);
  } catch (error) {
    console.error(error);

    res.status(502).json({
      error: "Não foi possível obter a lista M3U.",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`M3U Server rodando na porta ${PORT}`);
  console.log(`Fonte configurada: ${M3U_SOURCE_URL ? "SIM" : "NÃO"}`);
});
