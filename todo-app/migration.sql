CREATE TABLE task (
  "id" NUMERIC(10,2) DEFAULT gen_random_uuid() NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "completed" BOOLEAN DEFAULT FALSE NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT pk_task PRIMARY KEY (id)
);

CREATE INDEX idx_task_name ON task (name);
CREATE INDEX idx_task_created_at ON task (created_at);
CREATE INDEX idx_task_updated_at ON task (updated_at);

-- 应用信息
-- 应用名称: 待办事项应用
-- 应用描述: 一个用于追踪待办事项的简单应用，包括任务名称、完成状态和创建时间。
-- 生成时间: 2025-07-23T02:13:08.655Z
-- DSL版本: 1.0.0