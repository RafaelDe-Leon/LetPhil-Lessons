export interface Teacher {
  id: string
  name: string
  avatar?: string
}

export interface Video {
  id: string
  title: string
  date: string
  videoUrl: string
  category: string
  teacherId: string
  description?: string
  githubUrl?: string
}
