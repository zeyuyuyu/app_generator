// DSL类型定义
export interface DSLColumn {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'email' | 'url' | 'textarea';
  required?: boolean;
  unique?: boolean;
  primaryKey?: boolean;
}

export interface DSLEntity {
  name: string;
  columns: DSLColumn[];
  displayName?: string;
}

export interface DSLPage {
  name: string;
  type: 'list' | 'form' | 'detail' | 'dashboard' | 'kanban';
  entity: string;
  title?: string;
  description?: string;
}

export interface DSLPolicy {
  name: string;
  entity: string;
  action: 'create' | 'read' | 'update' | 'delete';
  condition?: string;
}

export interface AppDSL {
  name: string;
  description?: string;
  entities: DSLEntity[];
  pages: DSLPage[];
  policies?: DSLPolicy[];
  version?: string;
  createdAt?: string;
} 