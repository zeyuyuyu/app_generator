import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { Base44Generator } from './cli.js';

// 加载环境变量
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 中间件
app.use(express.static(join(__dirname, '../web-gui')));
app.use(express.json());

// 生成器实例
const generator = new Base44Generator();

// 路由
app.get('/', (req: Request, res: Response) => {
  res.sendFile(join(__dirname, '../web-gui/index.html'));
});

// API端点：获取预设模板
app.get('/api/templates', (req: Request, res: Response) => {
  const templates = [
    {
      id: 'blog',
      name: '个人博客系统',
      description: '包含文章、评论、分类管理的完整博客系统',
      prompt: '创建一个个人博客系统，包含：\n- 文章：标题、内容、作者、发布状态、发布时间\n- 评论：文章ID、作者、邮箱、内容\n- 分类：名称、描述\n需要文章列表页、文章详情页和管理界面'
    },
    {
      id: 'todo',
      name: '待办事项管理',
      description: '简单高效的任务管理应用',
      prompt: '创建一个待办事项管理应用，包含：\n- 任务：标题、描述、完成状态、优先级、截止日期\n- 分类：任务分类管理\n需要任务列表、添加任务表单和统计面板'
    },
    {
      id: 'ecommerce',
      name: '电商管理系统',
      description: '商品和订单管理的电商后台',
      prompt: '创建一个电商管理系统，包含：\n- 商品：名称、价格、库存、描述、分类、图片链接\n- 订单：订单号、客户信息、商品列表、总金额、状态\n- 客户：姓名、邮箱、电话、地址\n需要商品管理、订单管理和客户管理页面'
    },
    {
      id: 'crm',
      name: '客户关系管理',
      description: '管理客户信息和销售机会',
      prompt: '创建一个CRM客户关系管理系统，包含：\n- 客户：姓名、公司、邮箱、电话、地址、状态\n- 销售机会：客户ID、标题、金额、阶段、预计成交日期\n- 跟进记录：客户ID、内容、类型、时间\n需要客户列表、销售漏斗和数据面板'
    },
    {
      id: 'inventory',
      name: '库存管理系统',
      description: '商品库存和入出库管理',
      prompt: '创建一个库存管理系统，包含：\n- 商品：名称、SKU、分类、当前库存、最小库存、单价\n- 入库记录：商品ID、数量、单价、供应商、入库时间\n- 出库记录：商品ID、数量、原因、出库时间\n需要库存总览、入出库管理和库存预警'
    },
    {
      id: 'event',
      name: '活动管理系统',
      description: '活动组织和参与者管理',
      prompt: '创建一个活动管理系统，包含：\n- 活动：名称、描述、开始时间、结束时间、地点、最大参与人数\n- 参与者：姓名、邮箱、电话、报名时间、状态\n- 活动类型：名称、描述\n需要活动列表、参与者管理和活动统计面板'
    }
  ];
  
  res.json(templates);
});

// API端点：生成应用
app.post('/api/generate', async (req: Request, res: Response) => {
  const { prompt, outputName, options = {} } = req.body;
  
  if (!prompt || !outputName) {
    return res.status(400).json({ 
      success: false, 
      message: '缺少必要参数：prompt 和 outputName' 
    });
  }

  const socketId = req.headers['x-socket-id'] as string;
  const socket = socketId ? io.sockets.sockets.get(socketId) : null;

  try {
    // 发送进度更新
    const emitProgress = (step: string, message: string, progress: number) => {
      socket?.emit('progress', { step, message, progress });
    };

    emitProgress('start', '开始生成应用...', 0);
    
    emitProgress('dsl', '正在将需求转换为DSL...', 20);
    
    // 生成应用
    await generator.generateApp(prompt, `./generated-apps/${outputName}`, {
      ...options,
      onProgress: emitProgress
    });

    emitProgress('complete', '应用生成完成！', 100);

    res.json({ 
      success: true, 
      message: '应用生成成功！',
      outputPath: `./generated-apps/${outputName}`
    });

  } catch (error) {
    console.error('生成应用时出错:', error);
    socket?.emit('error', { 
      message: error instanceof Error ? error.message : '未知错误' 
    });
    
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : '生成失败' 
    });
  }
});

// API端点：获取生成的应用列表
app.get('/api/apps', (req: Request, res: Response) => {
  // 这里可以扫描generated-apps目录返回已生成的应用列表
  res.json({ apps: [] });
});

// Socket.IO连接处理
io.on('connection', (socket) => {
  console.log('客户端连接:', socket.id);

  socket.on('disconnect', () => {
    console.log('客户端断开连接:', socket.id);
  });
});

// 启动服务器
const PORT = process.env.WEB_PORT || 3001;
server.listen(PORT, () => {
  console.log('🌐 Base44生成器Web界面已启动!');
  console.log(`📱 访问地址: http://localhost:${PORT}`);
  console.log('🎨 享受可视化的应用生成体验！');
});

export { app, server, io }; 