import axios from 'axios'

const API_BASE_URL = '/api'

export interface Category {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await axios.get(`${API_BASE_URL}/categorys`)
    return response.data
  },

  async getById(id: string): Promise<Category> {
    const response = await axios.get(`${API_BASE_URL}/categorys/${id}`)
    return response.data
  },

  async create(data: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const response = await axios.post(`${API_BASE_URL}/categorys`, data)
    return response.data
  },

  async update(data: Partial<Category> & { id: string }): Promise<Category> {
    const { id, ...updateData } = data
    const response = await axios.put(`${API_BASE_URL}/categorys/${id}`, updateData)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/categorys/${id}`)
  }
}
