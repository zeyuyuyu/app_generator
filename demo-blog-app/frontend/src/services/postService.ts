import axios from 'axios'

const API_BASE_URL = '/api'

export interface Post {
  id: string
  title: string
  content: string
  author: string
  published: boolean
  publish_date: string
  created_at: string
  updated_at: string
}

export const postService = {
  async getAll(): Promise<Post[]> {
    const response = await axios.get(`${API_BASE_URL}/posts`)
    return response.data
  },

  async getById(id: string): Promise<Post> {
    const response = await axios.get(`${API_BASE_URL}/posts/${id}`)
    return response.data
  },

  async create(data: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post> {
    const response = await axios.post(`${API_BASE_URL}/posts`, data)
    return response.data
  },

  async update(data: Partial<Post> & { id: string }): Promise<Post> {
    const { id, ...updateData } = data
    const response = await axios.put(`${API_BASE_URL}/posts/${id}`, updateData)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/posts/${id}`)
  }
}
