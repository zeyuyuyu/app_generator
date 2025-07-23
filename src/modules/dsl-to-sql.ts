import { writeFileSync } from 'fs';
import { AppDSL, DSLEntity, DSLColumn } from '../types/dsl.js';

export class DSLToSQL {
  
  /**
   * 将DSL转换为PostgreSQL迁移脚本
   */
  generateMigration(dsl: AppDSL, schemaName: string = 'public'): string {
    const ddlStatements: string[] = [];
    
    // 如果不是public schema，创建schema
    if (schemaName !== 'public') {
      ddlStatements.push(`CREATE SCHEMA IF NOT EXISTS ${schemaName};`);
      ddlStatements.push('');
    }
    
    // 为每个实体生成表
    dsl.entities.forEach(entity => {
      const createTableSQL = this.generateCreateTable(entity, schemaName);
      ddlStatements.push(createTableSQL);
      ddlStatements.push('');
    });
    
    // 生成索引
    dsl.entities.forEach(entity => {
      const indexes = this.generateIndexes(entity, schemaName);
      if (indexes.length > 0) {
        ddlStatements.push(...indexes);
        ddlStatements.push('');
      }
    });
    
    // 生成注释
    ddlStatements.push('-- 应用信息');
    ddlStatements.push(`-- 应用名称: ${dsl.name}`);
    ddlStatements.push(`-- 应用描述: ${dsl.description || '无'}`);
    ddlStatements.push(`-- 生成时间: ${new Date().toISOString()}`);
    ddlStatements.push(`-- DSL版本: ${dsl.version || '1.0.0'}`);
    
    return ddlStatements.join('\n');
  }
  
  /**
   * 为单个实体生成CREATE TABLE语句
   */
  private generateCreateTable(entity: DSLEntity, schemaName: string): string {
    const tableName = `${schemaName === 'public' ? '' : schemaName + '.'}${entity.name}`;
    
    const columns = entity.columns.map(column => {
      return this.generateColumnDefinition(column);
    });
    
    const constraints: string[] = [];
    
    // 主键约束
    const primaryKeys = entity.columns.filter(col => col.primaryKey).map(col => col.name);
    if (primaryKeys.length > 0) {
      constraints.push(`  CONSTRAINT pk_${entity.name} PRIMARY KEY (${primaryKeys.join(', ')})`);
    }
    
    // 唯一约束
    const uniqueColumns = entity.columns.filter(col => col.unique && !col.primaryKey);
    uniqueColumns.forEach(col => {
      constraints.push(`  CONSTRAINT uk_${entity.name}_${col.name} UNIQUE (${col.name})`);
    });
    
    const allDefinitions = [...columns, ...constraints];
    
    return `CREATE TABLE ${tableName} (
${allDefinitions.join(',\n')}
);`;
  }
  
  /**
   * 生成单个列的定义
   */
  private generateColumnDefinition(column: DSLColumn): string {
    const type = this.mapColumnType(column.type);
    const nullable = column.required ? 'NOT NULL' : 'NULL';
    const defaultValue = this.getDefaultValue(column);
    
    let definition = `  "${column.name}" ${type}`;
    
    if (defaultValue) {
      definition += ` DEFAULT ${defaultValue}`;
    }
    
    definition += ` ${nullable}`;
    
    return definition;
  }
  
  /**
   * 映射DSL字段类型到PostgreSQL类型
   */
  private mapColumnType(type: DSLColumn['type']): string {
    const typeMap = {
      'text': 'VARCHAR(255)',
      'number': 'NUMERIC(10,2)',
      'date': 'TIMESTAMPTZ',
      'boolean': 'BOOLEAN',
      'email': 'VARCHAR(255)',
      'url': 'VARCHAR(500)',
      'textarea': 'TEXT'
    };
    
    return typeMap[type] || 'VARCHAR(255)';
  }
  
  /**
   * 获取字段的默认值
   */
  private getDefaultValue(column: DSLColumn): string | null {
    if (column.name === 'id' && column.primaryKey) {
      return "gen_random_uuid()";
    }
    
    if (column.name === 'created_at' || column.name === 'updated_at') {
      return "CURRENT_TIMESTAMP";
    }
    
    if (column.type === 'boolean') {
      return 'FALSE';
    }
    
    return null;
  }
  
  /**
   * 生成索引语句
   */
  private generateIndexes(entity: DSLEntity, schemaName: string): string[] {
    const indexes: string[] = [];
    const tableName = `${schemaName === 'public' ? '' : schemaName + '.'}${entity.name}`;
    
    // 为常见的查询字段创建索引
    entity.columns.forEach(column => {
      if (this.shouldCreateIndex(column)) {
        const indexName = `idx_${entity.name}_${column.name}`;
        indexes.push(`CREATE INDEX ${indexName} ON ${tableName} (${column.name});`);
      }
    });
    
    return indexes;
  }
  
  /**
   * 判断是否应该为字段创建索引
   */
  private shouldCreateIndex(column: DSLColumn): boolean {
    // 主键和唯一字段会自动有索引
    if (column.primaryKey || column.unique) {
      return false;
    }
    
    // 为这些字段类型创建索引
    const indexableTypes = ['email', 'date'];
    if (indexableTypes.includes(column.type)) {
      return true;
    }
    
    // 为常见的查询字段创建索引
    const commonSearchFields = ['name', 'title', 'status', 'type', 'category'];
    if (commonSearchFields.includes(column.name)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * 保存迁移脚本到文件
   */
  saveToFile(sql: string, filename: string = 'migration.sql'): void {
    writeFileSync(filename, sql, 'utf8');
    console.log(`迁移脚本已保存到: ${filename}`);
  }
  
  /**
   * 生成回滚脚本
   */
  generateRollback(dsl: AppDSL, schemaName: string = 'public'): string {
    const statements: string[] = [];
    
    // 删除表（注意顺序，先删除有外键的表）
    dsl.entities.reverse().forEach(entity => {
      const tableName = `${schemaName === 'public' ? '' : schemaName + '.'}${entity.name}`;
      statements.push(`DROP TABLE IF EXISTS ${tableName} CASCADE;`);
    });
    
    // 如果不是public schema，删除schema
    if (schemaName !== 'public') {
      statements.push(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE;`);
    }
    
    return statements.join('\n');
  }
}

// 便捷函数
export function dslToSql(dsl: AppDSL, schemaName: string = 'public'): string {
  const generator = new DSLToSQL();
  return generator.generateMigration(dsl, schemaName);
}

export function saveMigration(dsl: AppDSL, schemaName: string = 'public', filename?: string): void {
  const generator = new DSLToSQL();
  const sql = generator.generateMigration(dsl, schemaName);
  generator.saveToFile(sql, filename);
} 