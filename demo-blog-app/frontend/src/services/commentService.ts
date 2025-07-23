import axios from 'axios'

const API_BASE_URL = '/api'

export interface Comment {
  id: string
  post_id: string
  author: string
  email: string
  content: string
  approved: boolean
  created_at: string
  updated_at: string
}

export const commentService = {
  async getAll(): Promise<Comment[]> {
    const response = await axios.get(`${API_BASE_URL}/comments`)
    return response.data
  },

  async getById(id: string): Promise<Comment> {
    const response = await axios.get(`${API_BASE_URL}/comments/${id}`)
    return response.data
  },

  async create(data: Omit<Comment, 'id' | 'created_at' | 'updated_at'>): Promise<Comment> {
    const response = await axios.post(`${API_BASE_URL}/comments`, data)
    return response.data
  },

  async update(data: Partial<Comment> & { id: string }): Promise<Comment> {
    const { id, ...updateData } = data
    const response = await axios.put(`${API_BASE_URL}/comments/${id}`, updateData)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/comments/${id}`)
  }
}
