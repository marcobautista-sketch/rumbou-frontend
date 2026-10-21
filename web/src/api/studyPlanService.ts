import axios from 'axios'
import type { Book, TopicBooks, TopicVideos } from '../types/studyPlan'
import { apiClient } from './client'

// Open Library es pública: va sin el token de RumboU ni cookies.
const openLibraryClient = axios.create({ baseURL: 'https://openlibrary.org', timeout: 10000 })

interface OpenLibraryResponse {
  docs: {
    key: string
    title: string
    author_name?: string[]
    first_publish_year?: number
    cover_i?: number
  }[]
}

async function fromOpenLibrary(query: string, signal?: AbortSignal): Promise<Book[]> {
  const { data } = await openLibraryClient.get<OpenLibraryResponse>('/search.json', {
    params: {
      title: query,
      language: 'spa',
      limit: 3,
      fields: 'key,title,author_name,first_publish_year,cover_i',
    },
    signal,
  })
  return data.docs.map((doc) => ({
    title: doc.title,
    authors: doc.author_name ?? [],
    year: doc.first_publish_year ? String(doc.first_publish_year) : null,
    coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
    url: `https://openlibrary.org${doc.key}`,
    source: 'Open Library',
  }))
}

export const studyPlanService = {
  // Google Books sale del backend (con la clave y reintentos); si no trae nada, Open Library
  // con la misma consulta afinada. Si el backend ni responde, se busca por el nombre del tema.
  async books(topicId: number, topic: string, signal?: AbortSignal) {
    let query = topic
    try {
      const { data } = await apiClient.get<TopicBooks>(`/temas/${topicId}/libros`, { signal })
      if (data.libros.length > 0) {
        return data.libros.map<Book>((libro) => ({
          title: libro.titulo,
          authors: libro.autores,
          year: libro.anio,
          coverUrl: libro.portadaUrl,
          url: libro.url,
          source: 'Google Books',
        }))
      }
      query = data.consulta
    } catch (error) {
      if (axios.isCancel(error)) throw error
    }
    return fromOpenLibrary(query, signal)
  },

  // Los videos también pasan por el backend: la clave de YouTube no puede viajar al navegador.
  async videos(topicId: number, signal?: AbortSignal) {
    const { data } = await apiClient.get<TopicVideos>(`/temas/${topicId}/videos`, { signal })
    return data
  },
}
