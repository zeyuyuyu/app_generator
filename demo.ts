/**
 * Base44风格应用生成器演示
 * 
 * 这个文件展示了如何使用生成器的各个模块来创建完整的Web应用
 */

import dotenv from 'dotenv';
import { Base44Generator } from './src/cli.js';

// 加载环境变量
dotenv.config();

async function runDemo() {
  console.log('🎯 Base44风格应用生成器演示');
  console.log('=====================================');
  
  const generator = new Base44Generator();
  
  // 演示1: 生成一个简单的订阅管理应用
  console.log('\n📋 演示1: 订阅管理应用');
  const subscriptionPrompt = `
    创建一个订阅支出追踪器应用。需要管理：
    - 订阅服务：名称(text)、价格(number)、账单周期(text)、是否启用(boolean)、网站链接(url)
    - 支付记录：订阅ID、支付金额(number)、支付日期(date)、支付状态(text)
    希望有一个仪表板显示总支出和即将到期的订阅
  `;
  
  try {
    await generator.generateApp(subscriptionPrompt, './demo-subscription-app', {
      schemaName: 'subscription_tracker'
    });
  } catch (error) {
    console.log('演示1需要OpenAI API密钥，跳过...');
  }
  
  // 演示2: 从DSL生成博客应用  
  console.log('\n📋 演示2: 从预定义DSL生成博客应用');
  
  const blogDSL = {
    name: "个人博客系统",
    description: "一个简单的个人博客管理系统",
    version: "1.0.0",
    entities: [
      {
        name: "post",
        displayName: "文章",
        columns: [
          { name: "id", type: "text", primaryKey: true, required: true, unique: true },
          { name: "title", type: "text", required: true },
          { name: "content", type: "textarea", required: true },
          { name: "author", type: "text", required: true },
          { name: "published", type: "boolean", required: false },
          { name: "publish_date", type: "date", required: false },
          { name: "created_at", type: "date", required: true },
          { name: "updated_at", type: "date", required: true }
        ]
      },
      {
        name: "comment",
        displayName: "评论", 
        columns: [
          { name: "id", type: "text", primaryKey: true, required: true, unique: true },
          { name: "post_id", type: "text", required: true },
          { name: "author", type: "text", required: true },
          { name: "email", type: "email", required: true },
          { name: "content", type: "textarea", required: true },
          { name: "approved", type: "boolean", required: false },
          { name: "created_at", type: "date", required: true },
          { name: "updated_at", type: "date", required: true }
        ]
      },
      {
        name: "category", 
        displayName: "分类",
        columns: [
          { name: "id", type: "text", primaryKey: true, required: true, unique: true },
          { name: "name", type: "text", required: true, unique: true },
          { name: "description", type: "textarea", required: false },
          { name: "created_at", type: "date", required: true },
          { name: "updated_at", type: "date", required: true }
        ]
      }
    ],
    pages: [
      { name: "post-list", type: "list", entity: "post", title: "文章列表", description: "管理所有博客文章" },
      { name: "post-form", type: "form", entity: "post", title: "文章表单", description: "创建和编辑文章" },
      { name: "post-detail", type: "detail", entity: "post", title: "文章详情", description: "查看文章详细信息" },
      { name: "comment-list", type: "list", entity: "comment", title: "评论管理", description: "管理文章评论" },
      { name: "category-list", type: "list", entity: "category", title: "分类管理", description: "管理文章分类" },
      { name: "dashboard", type: "dashboard", entity: "post", title: "仪表板", description: "博客统计概览" }
    ]
  };
  
  // 先保存DSL到文件
  const fs = await import('fs');
  const dslFilePath = './demo-blog-dsl.json';
  fs.writeFileSync(dslFilePath, JSON.stringify(blogDSL, null, 2));
  console.log(`📄 博客DSL已保存到: ${dslFilePath}`);
  
  try {
    await generator.generateFromDSL(dslFilePath, './demo-blog-app', {
      schemaName: 'blog_system'
    });
    
    // 清理临时文件
    fs.unlinkSync(dslFilePath);
    
  } catch (error) {
    console.error('演示2生成失败:', error);
  }
  
  // 演示3: 展示各个模块的独立使用
  console.log('\n📋 演示3: 独立模块使用');
  
  // 展示DSL到SQL的转换
  console.log('\n🗄️  DSL -> SQL转换:');
  const { dslToSql } = await import('./src/modules/dsl-to-sql.js');
  const sql = dslToSql(blogDSL as any, 'demo_schema');
  console.log('✅ SQL迁移脚本生成完成');
  console.log('预览前几行:');
  console.log(sql.split('\n').slice(0, 10).join('\n'));
  console.log('...(省略)');
  
  // 保存SQL到文件
  const sqlPath = './demo-blog-migration.sql';
  fs.writeFileSync(sqlPath, sql);
  console.log(`💾 完整SQL已保存到: ${sqlPath}`);
  
  console.log('\n🎉 演示完成！');
  console.log('\n📋 生成的文件:');
  console.log('   - ./demo-subscription-app/ (订阅管理应用)');
  console.log('   - ./demo-blog-app/ (博客应用)');
  console.log('   - ./demo-blog-migration.sql (数据库迁移)');
  console.log('\n💡 你可以：');
  console.log('   1. 查看生成的代码结构');
  console.log('   2. 使用Docker启动应用: cd demo-blog-app && docker-compose up');
  console.log('   3. 手动设置环境后启动开发服务器');
  console.log('   4. 修改DSL文件重新生成');
}

// 运行演示
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(console.error);
} 