# RumboU · Frontend

Web y app móvil de **RumboU**, la plataforma de preparación para el examen de admisión de la UNI y la UNMSM. Consume la API de [`rumbou-backend`](https://github.com/marcobautista-sketch/rumbou-backend).

CS 2031 Desarrollo Basado en Plataformas (UTEC).

- **Integrantes:** Marco Emilio Bautista Ortega, Fabiana Gomez, Juan Carlos Alexander Vergara Montalván y Zoe Camila Garrido Cantoni

## Cómo correrlo

Requisitos: Node.js 22 o superior y el backend corriendo (en local queda en `http://localhost:8080`).

### Web

```bash
cd web
npm install
npm run dev
```

Se abre en `http://localhost:5173`.

### Móvil

```bash
cd mobile
npm install
npx expo start
```

Escanea el código QR con la app **Expo Go** (Android o iOS).
