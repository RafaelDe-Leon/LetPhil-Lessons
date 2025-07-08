export interface Video {
  id: string
  title: string
  description?: string
  videoUrl: string
  githubUrl?: string
  date: string
  category: string
  level?: string
  tag?: string
  coachId?: string
  teacherId?: string // For backward compatibility
  createdAt?: any
  updatedAt?: any
}

export interface Coach {
  id: string
  name: string
  avatar?: string | null
  bio?: string
  specialties?: string[]
  contactInfo?: {
    email?: string
    linkedin?: string
    twitter?: string
  }
  availability?: {
    timezone?: string
    schedule?: string
  }
}

export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  isAdmin: boolean
  isCoach: boolean
  isSubscriber: boolean
  createdAt: any
  lastLoginAt: any
  updatedAt?: any
}

// New interface for app settings
export interface AppSettings {
  id: string
  requireSubscriptionForVideos: boolean
  createdAt: any
  updatedAt: any
  createdBy: string // Admin user ID who created/updated the setting
}
