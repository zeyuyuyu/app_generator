import axios from 'axios'

const API_BASE_URL = '/api'

export interface Subscription {
  id: string
  name: string
  price: number
  billingCycle: string
  isEnabled: boolean
  websiteLink: string
  created_at: string
  updated_at: string
}

export const subscriptionService = {
  async getAll(): Promise<Subscription[]> {
    const response = await axios.get(`${API_BASE_URL}/subscriptions`)
    return response.data
  },

  async getById(id: string): Promise<Subscription> {
    const response = await axios.get(`${API_BASE_URL}/subscriptions/${id}`)
    return response.data
  },

  async create(data: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription> {
    const response = await axios.post(`${API_BASE_URL}/subscriptions`, data)
    return response.data
  },

  async update(data: Partial<Subscription> & { id: string }): Promise<Subscription> {
    const { id, ...updateData } = data
    const response = await axios.put(`${API_BASE_URL}/subscriptions/${id}`, updateData)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/subscriptions/${id}`)
  }
}
