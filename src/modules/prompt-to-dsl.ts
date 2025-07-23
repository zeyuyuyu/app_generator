import OpenAI from 'openai';
import { AppDSL } from '../types/dsl.js';

const systemPrompt = `
You are AppArchitect, an expert system that converts user requests into structured JSON DSL for web applications.

Your task is to analyze the user's request and generate a complete application specification using the following JSON structure:

{
  "name": "应用名称",
  "description": "应用描述",
  "entities": [
    {
      "name": "实体名称（单数形式，如user、post、order）",
      "displayName": "显示名称",
      "columns": [
        {
          "name": "字段名称",
          "type": "字段类型（text|number|date|boolean|email|url|textarea）",
          "required": true/false,
          "unique": true/false,
          "primaryKey": true/false
        }
      ]
    }
  ],
  "pages": [
    {
      "name": "页面名称",
      "type": "页面类型（list|form|detail|dashboard|kanban）",
      "entity": "关联的实体名称",
      "title": "页面标题",
      "description": "页面描述"
    }
  ]
}

规则：
1. 每个实体必须有一个id字段作为主键
2. 常见字段类型映射：
   - 名称、标题、描述等 -> text
   - 金额、数量、年龄等 -> number  
   - 创建时间、更新时间等 -> date
   - 是否标记等 -> boolean
   - 邮箱 -> email
   - 网址 -> url
   - 长文本、备注等 -> textarea
3. 自动为每个实体生成基本页面：列表页(list)、表单页(form)、详情页(detail)
4. 根据应用类型决定是否需要仪表板页面
5. 只返回有效的JSON，不要包含任何其他文本

示例：
用户输入："订阅支出追踪器，字段：名称 text, 金额 number, 周期 text"
输出：有效的JSON DSL结构
`;

export class PromptToDSL {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async convert(prompt: string): Promise<AppDSL> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('OpenAI返回了空的响应');
      }

      const dsl = JSON.parse(content) as AppDSL;
      
      // 验证和补充DSL
      this.validateAndEnrichDSL(dsl);
      
      return dsl;
    } catch (error) {
      console.error('转换prompt到DSL时发生错误:', error);
      throw error;
    }
  }

  private validateAndEnrichDSL(dsl: AppDSL): void {
    // 确保每个实体都有id字段
    dsl.entities.forEach(entity => {
      const hasId = entity.columns.some(col => col.name === 'id');
      if (!hasId) {
        entity.columns.unshift({
          name: 'id',
          type: 'text',
          primaryKey: true,
          required: true,
          unique: true
        });
      }

      // 添加默认的时间戳字段
      const hasCreatedAt = entity.columns.some(col => col.name === 'created_at');
      const hasUpdatedAt = entity.columns.some(col => col.name === 'updated_at');
      
      if (!hasCreatedAt) {
        entity.columns.push({
          name: 'created_at',
          type: 'date',
          required: true
        });
      }
      
      if (!hasUpdatedAt) {
        entity.columns.push({
          name: 'updated_at', 
          type: 'date',
          required: true
        });
      }
    });

    // 确保每个实体都有基本页面
    dsl.entities.forEach(entity => {
      const entityPages = dsl.pages.filter(page => page.entity === entity.name);
      
      const pageTypes = ['list', 'form', 'detail'];
      pageTypes.forEach(type => {
        const exists = entityPages.some(page => page.type === type);
        if (!exists) {
          dsl.pages.push({
            name: `${entity.name}-${type}`,
            type: type as any,
            entity: entity.name,
            title: `${entity.displayName || entity.name} ${type === 'list' ? '列表' : type === 'form' ? '表单' : '详情'}`,
            description: `${entity.displayName || entity.name}的${type === 'list' ? '列表' : type === 'form' ? '表单' : '详情'}页面`
          });
        }
      });
    });

    // 添加元数据
    dsl.version = '1.0.0';
    dsl.createdAt = new Date().toISOString();
  }
}

// 便捷函数
export async function promptToDsl(prompt: string, apiKey?: string): Promise<AppDSL> {
  const converter = new PromptToDSL(apiKey);
  return await converter.convert(prompt);
} 