import { AppDSL, DSLEntity, DSLColumn, DSLPage } from '../types/dsl.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export class DSLToUI {
  
  /**
   * 生成完整的React应用
   */
  generateReactApp(dsl: AppDSL, outputDir: string): void {
    // 创建输出目录结构
    mkdirSync(outputDir, { recursive: true });
    mkdirSync(join(outputDir, 'src'), { recursive: true });
    mkdirSync(join(outputDir, 'src', 'components'), { recursive: true });
    mkdirSync(join(outputDir, 'src', 'pages'), { recursive: true });
    mkdirSync(join(outputDir, 'src', 'services'), { recursive: true });
    mkdirSync(join(outputDir, 'public'), { recursive: true });
    
    // 生成配置文件
    this.generatePackageJson(dsl, outputDir);
    this.generateTailwindConfig(outputDir);
    this.generateViteConfig(outputDir);
    
    // 生成入口文件
    this.generateIndexHtml(dsl, outputDir);
    this.generateMainTsx(dsl, outputDir);
    this.generateAppTsx(dsl, outputDir);
    
    // 生成通用组件
    this.generateComponents(dsl, outputDir);
    
    // 生成页面
    this.generatePages(dsl, outputDir);
    
    // 生成API服务
    this.generateServices(dsl, outputDir);
    
    // 生成样式
    this.generateStyles(outputDir);
    
    console.log(`React应用已生成到: ${outputDir}`);
  }
  
  /**
   * 生成package.json
   */
  private generatePackageJson(dsl: AppDSL, outputDir: string): void {
    const packageJson = {
      name: dsl.name.toLowerCase().replace(/\s+/g, '-'),
      version: dsl.version || '1.0.0',
      description: dsl.description || '',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview',
        lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0'
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.8.0',
        'react-query': '^3.39.0',
        axios: '^1.6.0',
        'lucide-react': '^0.294.0',
        clsx: '^2.0.0',
        'tailwind-merge': '^2.0.0'
      },
      devDependencies: {
        '@types/react': '^18.2.43',
        '@types/react-dom': '^18.2.17',
        '@typescript-eslint/eslint-plugin': '^6.14.0',
        '@typescript-eslint/parser': '^6.14.0',
        '@vitejs/plugin-react': '^4.2.1',
        autoprefixer: '^10.4.16',
        eslint: '^8.55.0',
        'eslint-plugin-react-hooks': '^4.6.0',
        'eslint-plugin-react-refresh': '^0.4.5',
        postcss: '^8.4.32',
        tailwindcss: '^3.3.6',
        typescript: '^5.2.2',
        vite: '^5.0.8'
      }
    };
    
    writeFileSync(join(outputDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  }
  
  /**
   * 生成Vite配置
   */
  private generateViteConfig(outputDir: string): void {
    const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/api/, '')
      }
    }
  }
})
`;
    
    writeFileSync(join(outputDir, 'vite.config.ts'), viteConfig);
  }
  
  /**
   * 生成Tailwind配置
   */
  private generateTailwindConfig(outputDir: string): void {
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
    
    writeFileSync(join(outputDir, 'tailwind.config.js'), tailwindConfig);
    
    const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
    
    writeFileSync(join(outputDir, 'postcss.config.js'), postcssConfig);
  }
  
  /**
   * 生成index.html
   */
  private generateIndexHtml(dsl: AppDSL, outputDir: string): void {
    const indexHtml = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${dsl.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
    
    writeFileSync(join(outputDir, 'index.html'), indexHtml);
  }
  
  /**
   * 生成main.tsx
   */
  private generateMainTsx(dsl: AppDSL, outputDir: string): void {
    const mainTsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
`;
    
    writeFileSync(join(outputDir, 'src', 'main.tsx'), mainTsx);
  }
  
  /**
   * 生成App.tsx主组件
   */
  private generateAppTsx(dsl: AppDSL, outputDir: string): void {
    const imports = dsl.entities.map(entity => 
      `import ${this.capitalize(entity.name)}List from './pages/${this.capitalize(entity.name)}List'`
    ).join('\n');
    
    const routes = dsl.entities.map(entity => 
      `          <Route path="/${entity.name}s" element={<${this.capitalize(entity.name)}List />} />`
    ).join('\n');
    
    const navLinks = dsl.entities.map(entity => 
      `            <Link 
              to="/${entity.name}s" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              ${entity.displayName || this.capitalize(entity.name)}
            </Link>`
    ).join('\n');
    
    const appTsx = `import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { Home, Menu } from 'lucide-react'
import { useState } from 'react'
${imports}

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
                <span className="font-bold text-xl text-gray-900">${dsl.name}</span>
              </Link>
            </div>
            
            {/* 桌面导航 */}
            <div className="hidden md:flex items-center space-x-4">
${navLinks}
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
${navLinks}
            </div>
          </div>
        )}
      </nav>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={
            <div className="text-center py-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">${dsl.name}</h1>
              <p className="text-xl text-gray-600 mb-8">${dsl.description || '欢迎使用您的应用'}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
${dsl.entities.map(entity => `
                <Link 
                  to="/${entity.name}s"
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">${entity.displayName || this.capitalize(entity.name)}</h3>
                  <p className="text-gray-600">管理${entity.displayName || entity.name}</p>
                </Link>`).join('')}
              </div>
            </div>
          } />
${routes}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
`;
    
    writeFileSync(join(outputDir, 'src', 'App.tsx'), appTsx);
  }
  
  /**
   * 生成页面组件
   */
  private generatePages(dsl: AppDSL, outputDir: string): void {
    dsl.entities.forEach(entity => {
      const listPageContent = this.generateListPage(entity);
      writeFileSync(join(outputDir, 'src', 'pages', `${this.capitalize(entity.name)}List.tsx`), listPageContent);
    });
  }
  
  /**
   * 生成列表页面
   */
  private generateListPage(entity: DSLEntity): string {
    const className = this.capitalize(entity.name);
    const columns = entity.columns.filter(col => !['id', 'created_at', 'updated_at'].includes(col.name));
    
    const tableHeaders = columns.map(col => 
      `            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${col.name}</th>`
    ).join('\n');
    
    const tableRows = columns.map(col => 
      `              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.${col.name}}</td>`
    ).join('\n');
    
    return `import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { ${entity.name}Service } from '../services/${entity.name}Service'

interface ${className} {
  id: string
${entity.columns.filter(col => col.name !== 'id').map(col => `  ${col.name}: ${this.getTypeScriptType(col.type)}`).join('\n')}
}

export default function ${className}List() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<${className} | null>(null)
  
  const queryClient = useQueryClient()
  
  // 获取数据
  const { data: items = [], isLoading, error } = useQuery<${className}[]>(
    '${entity.name}s',
    ${entity.name}Service.getAll
  )
  
  // 删除操作
  const deleteMutation = useMutation(${entity.name}Service.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('${entity.name}s')
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
  
  const handleEdit = (item: ${className}) => {
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
          <h1 className="text-2xl font-bold text-gray-900">${entity.displayName || className}</h1>
          <p className="mt-1 text-sm text-gray-600">管理所有${entity.displayName || entity.name}</p>
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
${tableHeaders}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id}>
${tableRows}
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
        <${className}Form 
          item={editingItem}
          onClose={() => {
            setShowForm(false)
            setEditingItem(null)
          }}
          onSave={() => {
            setShowForm(false)
            setEditingItem(null)
            queryClient.invalidateQueries('${entity.name}s')
          }}
        />
      )}
    </div>
  )
}

// 表单组件（简化版本）
function ${className}Form({ 
  item, 
  onClose, 
  onSave 
}: { 
  item: ${className} | null
  onClose: () => void
  onSave: () => void 
}) {
  const [formData, setFormData] = useState(item || {})
  
  const saveMutation = useMutation(
    item ? ${entity.name}Service.update : ${entity.name}Service.create,
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
        <h2 className="text-lg font-semibold mb-4">{item ? '编辑' : '新增'} ${entity.displayName || entity.name}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
${columns.map(col => this.generateFormField(col)).join('\n')}
          
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
`;
  }
  
  /**
   * 生成表单字段
   */
  private generateFormField(column: DSLColumn): string {
    switch (column.type) {
      case 'boolean':
        return `          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.${column.name} || false}
                onChange={(e) => setFormData({...formData, ${column.name}: e.target.checked})}
                className="mr-2"
              />
              ${column.name}
            </label>
          </div>`;
      
      case 'textarea':
        return `          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">${column.name}</label>
            <textarea
              value={formData.${column.name} || ''}
              onChange={(e) => setFormData({...formData, ${column.name}: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>`;
      
      case 'date':
        return `          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">${column.name}</label>
            <input
              type="datetime-local"
              value={formData.${column.name} || ''}
              onChange={(e) => setFormData({...formData, ${column.name}: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>`;
      
      case 'number':
        return `          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">${column.name}</label>
            <input
              type="number"
              value={formData.${column.name} || ''}
              onChange={(e) => setFormData({...formData, ${column.name}: parseFloat(e.target.value)})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>`;
      
      default:
        return `          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">${column.name}</label>
            <input
              type="${column.type === 'email' ? 'email' : 'text'}"
              value={formData.${column.name} || ''}
              onChange={(e) => setFormData({...formData, ${column.name}: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>`;
    }
  }
  
  /**
   * 生成API服务
   */
  private generateServices(dsl: AppDSL, outputDir: string): void {
    dsl.entities.forEach(entity => {
      const serviceContent = this.generateEntityService(entity);
      writeFileSync(join(outputDir, 'src', 'services', `${entity.name}Service.ts`), serviceContent);
    });
  }
  
  /**
   * 生成单个实体的API服务
   */
  private generateEntityService(entity: DSLEntity): string {
    const className = this.capitalize(entity.name);
    const urlPath = entity.name + 's';
    
    return `import axios from 'axios'

const API_BASE_URL = '/api'

export interface ${className} {
  id: string
${entity.columns.filter(col => col.name !== 'id').map(col => `  ${col.name}: ${this.getTypeScriptType(col.type)}`).join('\n')}
}

export const ${entity.name}Service = {
  async getAll(): Promise<${className}[]> {
    const response = await axios.get(\`\${API_BASE_URL}/${urlPath}\`)
    return response.data
  },

  async getById(id: string): Promise<${className}> {
    const response = await axios.get(\`\${API_BASE_URL}/${urlPath}/\${id}\`)
    return response.data
  },

  async create(data: Omit<${className}, 'id' | 'created_at' | 'updated_at'>): Promise<${className}> {
    const response = await axios.post(\`\${API_BASE_URL}/${urlPath}\`, data)
    return response.data
  },

  async update(data: Partial<${className}> & { id: string }): Promise<${className}> {
    const { id, ...updateData } = data
    const response = await axios.put(\`\${API_BASE_URL}/${urlPath}/\${id}\`, updateData)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await axios.delete(\`\${API_BASE_URL}/${urlPath}/\${id}\`)
  }
}
`;
  }
  
  /**
   * 生成组件
   */
  private generateComponents(dsl: AppDSL, outputDir: string): void {
    // 这里可以添加通用组件的生成
    // 暂时跳过，专注于核心功能
  }
  
  /**
   * 生成样式文件
   */
  private generateStyles(outputDir: string): void {
    const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`;
    
    writeFileSync(join(outputDir, 'src', 'index.css'), indexCss);
  }
  
  /**
   * 映射到TypeScript类型
   */
  private getTypeScriptType(type: DSLColumn['type']): string {
    const typeMap = {
      'text': 'string',
      'number': 'number',
      'date': 'string',
      'boolean': 'boolean',
      'email': 'string',
      'url': 'string',
      'textarea': 'string'
    };
    
    return typeMap[type] || 'string';
  }
  
  /**
   * 首字母大写
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// 便捷函数
export function generateUI(dsl: AppDSL, outputDir: string): void {
  const generator = new DSLToUI();
  generator.generateReactApp(dsl, outputDir);
} 