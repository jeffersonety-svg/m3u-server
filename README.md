# M3U Server

Servidor Node.js simples para disponibilizar uma lista M3U hospedada no GitHub.

## Variáveis

`M3U_SOURCE_URL` = URL RAW da lista M3U.

`PORT` = porta da aplicação. O padrão é 3000.

`CACHE_SECONDS` = tempo do cache em segundos. O padrão é 300 (5 minutos).

## Exemplo

```bash
M3U_SOURCE_URL="https://raw.githubusercontent.com/USUARIO/REPOSITORIO/main/lista.m3u" npm start
```

Depois:

```text
http://IP-DO-SERVIDOR:3000/lista.m3u
```

No Integrator, o domínio pode ser configurado para apontar para a aplicação.
