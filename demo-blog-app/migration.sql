CREATE SCHEMA IF NOT EXISTS blog_system;

CREATE TABLE blog_system.post (
  "id" VARCHAR(255) DEFAULT gen_random_uuid() NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "content" TEXT NOT NULL,
  "author" VARCHAR(255) NOT NULL,
  "published" BOOLEAN DEFAULT FALSE NULL,
  "publish_date" TIMESTAMPTZ NULL,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT pk_post PRIMARY KEY (id)
);

CREATE TABLE blog_system.comment (
  "id" VARCHAR(255) DEFAULT gen_random_uuid() NOT NULL,
  "post_id" VARCHAR(255) NOT NULL,
  "author" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "content" TEXT NOT NULL,
  "approved" BOOLEAN DEFAULT FALSE NULL,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT pk_comment PRIMARY KEY (id)
);

CREATE TABLE blog_system.category (
  "id" VARCHAR(255) DEFAULT gen_random_uuid() NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT NULL,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT pk_category PRIMARY KEY (id),
  CONSTRAINT uk_category_name UNIQUE (name)
);

CREATE INDEX idx_post_title ON blog_system.post (title);
CREATE INDEX idx_post_publish_date ON blog_system.post (publish_date);
CREATE INDEX idx_post_created_at ON blog_system.post (created_at);
CREATE INDEX idx_post_updated_at ON blog_system.post (updated_at);

CREATE INDEX idx_comment_email ON blog_system.comment (email);
CREATE INDEX idx_comment_created_at ON blog_system.comment (created_at);
CREATE INDEX idx_comment_updated_at ON blog_system.comment (updated_at);

CREATE INDEX idx_category_created_at ON blog_system.category (created_at);
CREATE INDEX idx_category_updated_at ON blog_system.category (updated_at);

-- 应用信息
-- 应用名称: 个人博客系统
-- 应用描述: 一个简单的个人博客管理系统
-- 生成时间: 2025-07-23T02:11:49.520Z
-- DSL版本: 1.0.0