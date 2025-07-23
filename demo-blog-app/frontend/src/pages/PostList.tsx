import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { postService } from '../services/postService'

interface Post {
  id: string
  title: string
  content: string
  author: string
  published: boolean
  publish_date: string
  created_at: string
  updated_at: string
}

export default function PostList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Post | null>(null)
  
  const queryClient = useQueryClient()
  
  // 获取数据
  const { data: items = [], isLoading, error } = useQuery<Post[]>(
    'posts',
    postService.getAll
  )
  
  // 删除操作
  const deleteMutation = useMutation(postService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('posts')
    }
  })
  
  // 过滤数据
  const filteredItems = items.filter(item =>
    Object.values(item).some(value => 
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  )
  
  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个项目吗？')) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch (error) {
        alert('删除失败')
      }
    }
  }
  
  const handleEdit = (item: Post) => {
    setEditingItem(item)
    setShowForm(true)
  }
  
  if (isLoading) return <div className="flex justify-center py-8">加载中...</div>
  if (error) return <div className="text-red-600 text-center py-8">加载失败</div>
  
  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">文章</h1>
          <p className="mt-1 text-sm text-gray-600">管理所有文章</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null)
            setShowForm(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>新增</span>
        </button>
      </div>
      
      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="搜索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* 数据表格 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">content</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">author</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">published</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">publish_date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.title}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.content}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.author}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.published}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.publish_date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-900"
                    disabled={deleteMutation.isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无数据</p>
          </div>
        )}
      </div>
      
      {/* 表单弹窗 */}
      {showForm && (
        <PostForm 
          item={editingItem}
          onClose={() => {
            setShowForm(false)
            setEditingItem(null)
          }}
          onSave={() => {
            setShowForm(false)
            setEditingItem(null)
            queryClient.invalidateQueries('posts')
          }}
        />
      )}
    </div>
  )
}

// 表单组件（简化版本）
function PostForm({ 
  item, 
  onClose, 
  onSave 
}: { 
  item: Post | null
  onClose: () => void
  onSave: () => void 
}) {
  const [formData, setFormData] = useState(item || {})
  
  const saveMutation = useMutation(
    item ? postService.update : postService.create,
    {
      onSuccess: onSave
    }
  )
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (item) {
        await saveMutation.mutateAsync({ id: item.id, ...formData })
      } else {
        await saveMutation.mutateAsync(formData)
      }
    } catch (error) {
      alert('保存失败')
    }
  }
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">{item ? '编辑' : '新增'} 文章</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">title</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">content</label>
            <textarea
              value={formData.content || ''}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">author</label>
            <input
              type="text"
              value={formData.author || ''}
              onChange={(e) => setFormData({...formData, author: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.published || false}
                onChange={(e) => setFormData({...formData, published: e.target.checked})}
                className="mr-2"
              />
              published
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">publish_date</label>
            <input
              type="datetime-local"
              value={formData.publish_date || ''}
              onChange={(e) => setFormData({...formData, publish_date: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={saveMutation.isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
            >
              {saveMutation.isLoading ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
