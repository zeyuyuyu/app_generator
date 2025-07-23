import axios from 'axios'

const API_BASE_URL = '/api'

export interface Task {
  id: string
  name: string
  completed: boolean
  created_at: string
  updated_at: string
}

export const taskService = {
  async getAll(): Promise<Task[]> {
    const response = await axios.get(`${API_BASE_URL}/tasks`)
    return response.data
  },

  async getById(id: string): Promise<Task> {
    const response = await axios.get(`${API_BASE_URL}/tasks/${id}`)
    return response.data
  },

  async create(data: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const response = await axios.post(`${API_BASE_URL}/tasks`, data)
    return response.data
  },

  async update(data: Partial<Task> & { id: string }): Promise<Task> {
    const { id, ...updateData } = data
    const response = await axios.put(`${API_BASE_URL}/tasks/${id}`, updateData)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/tasks/${id}`)
  }
}
