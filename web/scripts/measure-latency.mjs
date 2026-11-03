// Mide la latencia real de los endpoints principales de la API desplegada. No crea ni cambia
// datos: solo hace lecturas (GET). El refresh sin cookie y el login opcional son los únicos POST.
//
//   npm run latency
//   RUMBOU_EMAIL=... RUMBOU_PASSWORD=... npm run latency     (añade los endpoints con sesión)
//   RUMBOU_API=https://mi-api/api/v1 SAMPLES=30 npm run latency
const API = process.env.RUMBOU_API ?? 'https://rumbou-frontend.vercel.app/api/v1'
const SAMPLES = Number(process.env.SAMPLES ?? 20)
const TARGET_MS = 500

const publicEndpoints = [
  ['GET', '/health'],
  ['GET', '/ofertas-academicas'],
  ['POST', '/auth/refresh'],
]

const privateEndpoints = [
  ['GET', '/areas'],
  ['GET', '/usuarios/me'],
  ['GET', '/usuarios/me/gamificacion'],
  ['GET', '/objetivos'],
  ['GET', '/preguntas'],
  ['GET', '/simulacros'],
  ['GET', '/desafios/hoy'],
  ['GET', '/progreso/dominio-temas'],
  ['GET', '/progreso/historial'],
  ['GET', '/suscripciones/me'],
]

async function request(method, path, headers) {
  const start = performance.now()
  const response = await fetch(API + path, { method, headers, signal: AbortSignal.timeout(10000) })
  await response.arrayBuffer()
  return { status: response.status, ms: performance.now() - start }
}

function percentile(sorted, p) {
  return sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)]
}

async function measure(method, path, headers = {}) {
  const samples = []
  const statuses = new Set()
  for (let i = 0; i < SAMPLES; i += 1) {
    try {
      const { status, ms } = await request(method, path, headers)
      statuses.add(status)
      samples.push(ms)
    } catch (error) {
      statuses.add(error.name)
      // Si no responde dos veces seguidas no vale la pena esperar el resto de muestras.
      if (samples.length === 0 && i >= 1) break
    }
  }
  if (samples.length === 0) return { method, path, status: [...statuses].join('/'), ok: 0 }
  const sorted = samples.toSorted((a, b) => a - b)
  return {
    method,
    path,
    status: [...statuses].join('/'),
    ok: samples.length,
    first: Math.round(samples[0]),
    p50: Math.round(percentile(sorted, 50)),
    p95: Math.round(percentile(sorted, 95)),
    max: Math.round(sorted.at(-1)),
    under: percentile(sorted, 95) < TARGET_MS ? 'sí' : 'NO',
  }
}

async function login() {
  const { RUMBOU_EMAIL: email, RUMBOU_PASSWORD: password } = process.env
  if (!email || !password) return null
  const response = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) throw new Error(`El login respondió ${response.status}`)
  return (await response.json()).accessToken
}

const token = await login()
const rows = []
for (const [method, path] of publicEndpoints) rows.push(await measure(method, path))
for (const [method, path] of privateEndpoints) {
  rows.push(await measure(method, path, token ? { Authorization: `Bearer ${token}` } : {}))
}

console.log(`API: ${API}\nMuestras por endpoint: ${SAMPLES} | ${new Date().toISOString()}`)
console.log(token ? 'Con sesión iniciada' : 'Sin sesión: los endpoints privados deberían dar 401')
console.table(rows)
