import axios from 'axios'

const API_BASE_URL = '/api'

export interface PaymentRecord {
  id: string
  subscriptionId: string
  amount: number
  paymentDate: string
  paymentStatus: string
  created_at: string
  updated_at: string
}

export const paymentRecordService = {
  async getAll(): Promise<PaymentRecord[]> {
    const response = await axios.get(`${API_BASE_URL}/paymentRecords`)
    return response.data
  },

  async getById(id: string): Promise<PaymentRecord> {
    const response = await axios.get(`${API_BASE_URL}/paymentRecords/${id}`)
    return response.data
  },

  async create(data: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentRecord> {
    const response = await axios.post(`${API_BASE_URL}/paymentRecords`, data)
    return response.data
  },

  async update(data: Partial<PaymentRecord> & { id: string }): Promise<PaymentRecord> {
    const { id, ...updateData } = data
    const response = await axios.put(`${API_BASE_URL}/paymentRecords/${id}`, updateData)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/paymentRecords/${id}`)
  }
}
