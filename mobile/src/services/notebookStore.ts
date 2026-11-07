import { Directory, File, Paths } from 'expo-file-system'

export type NotebookStatus = 'REVIEW' | 'UNDERSTOOD'

// Solo se guarda el nombre de cada archivo: en iPhone la ruta completa de la app cambia al
// actualizarse, así que se arma de nuevo cada vez que se lee.
export interface NotebookEntry {
  questionId: number
  examId: number
  topic: string
  statement: string
  photo: string | null
  audio: string | null
  note: string
  status: NotebookStatus | null
  updatedAt: string
}

type NotebookIndex = Record<string, NotebookEntry>

// Con fotos de hasta 5 MB, este tope deja el cuaderno por debajo de 250 MB.
export const MAX_NOTEBOOK_PHOTOS = 50

const indexes = new Map<number, NotebookIndex>()
const unsaved = new Set<number>()
let writing = false

// Cada cuenta tiene su carpeta: cerrar sesión no borra nada y las cuentas no se mezclan.
function userDirectory(userId: number) {
  return new Directory(Paths.document, 'cuaderno', String(userId))
}

function indexFile(userId: number) {
  return new File(userDirectory(userId), 'index.json')
}

function readIndex(userId: number): NotebookIndex {
  const file = indexFile(userId)
  if (!file.exists) return {}
  try {
    return JSON.parse(file.textSync()) as NotebookIndex
  } catch {
    return {}
  }
}

function indexOf(userId: number) {
  let index = indexes.get(userId)
  if (!index) {
    index = readIndex(userId)
    indexes.set(userId, index)
  }
  return index
}

async function writeIndex(userId: number) {
  userDirectory(userId).create({ intermediates: true, idempotent: true })
  const file = indexFile(userId)
  if (!file.exists) file.create()
  await file.write(JSON.stringify(indexOf(userId)))
}

// La nota se guarda con cada tecla. Mientras hay una escritura en curso, los cambios nuevos solo
// quedan marcados y al terminar se escribe lo último: nunca se forma una fila de escrituras.
async function persist(userId: number) {
  unsaved.add(userId)
  if (writing) return
  writing = true
  while (unsaved.size > 0) {
    const [next] = unsaved
    unsaved.delete(next)
    try {
      await writeIndex(next)
    } catch {
      // Queda en memoria y se guarda con el siguiente cambio.
    }
  }
  writing = false
}

function isEmpty(entry: NotebookEntry) {
  return !entry.photo && !entry.audio && !entry.note.trim() && !entry.status
}

function deleteFile(userId: number, name: string | null) {
  if (!name) return
  const file = new File(userDirectory(userId), name)
  if (file.exists) file.delete()
}

export const notebookStore = {
  get(userId: number, questionId: number) {
    return indexOf(userId)[questionId] ?? null
  },

  // Primero lo que falta repasar y, dentro de cada grupo, lo más reciente.
  list(userId: number) {
    return Object.values(indexOf(userId)).sort(
      (a, b) =>
        Number(a.status === 'UNDERSTOOD') - Number(b.status === 'UNDERSTOOD') ||
        b.updatedAt.localeCompare(a.updatedAt),
    )
  },

  save(userId: number, entry: NotebookEntry) {
    const index = indexOf(userId)
    if (isEmpty(entry)) delete index[entry.questionId]
    else index[entry.questionId] = { ...entry, updatedAt: new Date().toISOString() }
    void persist(userId)
  },

  remove(userId: number, questionId: number) {
    const index = indexOf(userId)
    const entry = index[questionId]
    if (!entry) return
    deleteFile(userId, entry.photo)
    deleteFile(userId, entry.audio)
    delete index[questionId]
    void persist(userId)
  },

  photoCount(userId: number) {
    return Object.values(indexOf(userId)).filter((entry) => entry.photo).length
  },

  // La cámara y el grabador dejan sus archivos en una carpeta temporal que el sistema puede
  // vaciar: aquí pasan a la carpeta de documentos, que se conserva.
  async keepFile(userId: number, temporaryUri: string, name: string) {
    userDirectory(userId).create({ intermediates: true, idempotent: true })
    await new File(temporaryUri).copy(new File(userDirectory(userId), name))
    return name
  },

  deleteFile,

  fileUri(userId: number, name: string) {
    return new File(userDirectory(userId), name).uri
  },
}
