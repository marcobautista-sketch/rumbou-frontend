export interface Book {
  title: string
  authors: string[]
  year: string | null
  coverUrl: string | null
  url: string
  source: 'Google Books' | 'Open Library'
}

export interface TopicBooks {
  temaId: number
  tema: string
  consulta: string
  libros: {
    titulo: string
    autores: string[]
    anio: string | null
    portadaUrl: string | null
    url: string
  }[]
}

export interface Video {
  videoId: string
  titulo: string
  canal: string
  miniaturaUrl: string | null
  url: string
}

export interface TopicVideos {
  temaId: number
  tema: string
  videos: Video[]
  busquedaUrl: string
}
