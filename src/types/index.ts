export interface User {
  _id?: string
  name: string
  email: string
  password?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface BlogPost {
  _id?: string
  title: string
  content: string
  excerpt: string
  author: {
    id: string
    name: string
    email: string
  }
  createdAt?: Date
  updatedAt?: Date
  published: boolean
}

export interface CreatePostData {
  title: string
  content: string
  excerpt: string
}

export interface AuthFormData {
  name?: string
  email: string
  password: string
}