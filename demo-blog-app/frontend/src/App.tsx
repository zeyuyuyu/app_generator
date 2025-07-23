import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { Home, Menu } from 'lucide-react'
import { useState } from 'react'
import PostList from './pages/PostList'
import CommentList from './pages/CommentList'
import CategoryList from './pages/CategoryList'

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Home className="h-8 w-8 text-blue-600" />
                <span className="font-bold text-xl text-gray-900">个人博客系统</span>
              </Link>
            </div>
            
            {/* 桌面导航 */}
            <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/posts" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              文章
            </Link>
            <Link 
              to="/comments" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              评论
            </Link>
            <Link 
              to="/categorys" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              分类
            </Link>
            </div>
            
            {/* 移动端菜单按钮 */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
        
        {/* 移动端导航菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link 
              to="/posts" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              文章
            </Link>
            <Link 
              to="/comments" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              评论
            </Link>
            <Link 
              to="/categorys" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              分类
            </Link>
            </div>
          </div>
        )}
      </nav>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={
            <div className="text-center py-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">个人博客系统</h1>
              <p className="text-xl text-gray-600 mb-8">一个简单的个人博客管理系统</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">

                <Link 
                  to="/posts"
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">文章</h3>
                  <p className="text-gray-600">管理文章</p>
                </Link>
                <Link 
                  to="/comments"
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">评论</h3>
                  <p className="text-gray-600">管理评论</p>
                </Link>
                <Link 
                  to="/categorys"
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">分类</h3>
                  <p className="text-gray-600">管理分类</p>
                </Link>
              </div>
            </div>
          } />
          <Route path="/posts" element={<PostList />} />
          <Route path="/comments" element={<CommentList />} />
          <Route path="/categorys" element={<CategoryList />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
