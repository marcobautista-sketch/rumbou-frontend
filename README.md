# RumboU · Frontend

Web y app móvil de **RumboU**, la plataforma de preparación para el examen de admisión de la UNI y la UNMSM. Consume la API de [`rumbou-backend`](https://github.com/marcobautista-sketch/rumbou-backend).

CS 2031 Desarrollo Basado en Plataformas (UTEC).

- **Integrantes:** Marco Emilio Bautista Ortega, Fabiana Gomez, Juan Carlos Alexander Vergara Montalván y Zoe Camila Garrido Cantoni

## Cómo correrlo

Requisitos: Node.js 22 o superior y el backend corriendo (en local queda en `http://localhost:8080`).

La web llama a la API por `/api/v1` y el servidor de desarrollo reenvía esas llamadas al backend, así que la cookie de sesión es del mismo origen y no hay problemas de CORS. Los valores por defecto están en `web/.env.example`; para cambiarlos, cópialo como `web/.env.local`.

### Web

```bash
cd web
npm install
npm run dev
```

Se abre en `http://localhost:5173`.
