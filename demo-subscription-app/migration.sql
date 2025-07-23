CREATE SCHEMA IF NOT EXISTS subscription_tracker;

CREATE TABLE subscription_tracker.subscription (
  "id" VARCHAR(255) DEFAULT gen_random_uuid() NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "price" NUMERIC(10,2) NOT NULL,
  "billingCycle" VARCHAR(255) NOT NULL,
  "isEnabled" BOOLEAN DEFAULT FALSE NOT NULL,
  "websiteLink" VARCHAR(500) NULL,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT pk_subscription PRIMARY KEY (id)
);

CREATE TABLE subscription_tracker.paymentRecord (
  "id" VARCHAR(255) DEFAULT gen_random_uuid() NOT NULL,
  "subscriptionId" VARCHAR(255) NOT NULL,
  "amount" NUMERIC(10,2) NOT NULL,
  "paymentDate" TIMESTAMPTZ NOT NULL,
  "paymentStatus" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT pk_paymentRecord PRIMARY KEY (id)
);

CREATE INDEX idx_subscription_name ON subscription_tracker.subscription (name);
CREATE INDEX idx_subscription_created_at ON subscription_tracker.subscription (created_at);
CREATE INDEX idx_subscription_updated_at ON subscription_tracker.subscription (updated_at);

CREATE INDEX idx_paymentRecord_paymentDate ON subscription_tracker.paymentRecord (paymentDate);
CREATE INDEX idx_paymentRecord_created_at ON subscription_tracker.paymentRecord (created_at);
CREATE INDEX idx_paymentRecord_updated_at ON subscription_tracker.paymentRecord (updated_at);

-- 应用信息
-- 应用名称: 订阅支出追踪器
-- 应用描述: 管理订阅服务和支付记录，以及查看总支出和即将到期的订阅
-- 生成时间: 2025-07-23T02:11:49.513Z
-- DSL版本: 1.0.0