# 运行流程手册（RUNBOOK）

## 概要
- 前端：uni-app（H5），API `/api`
- 后端：Node 24 + Express（`server/`）
- DB：MongoDB；对象存储（可选）用于报表

## 本地运行
- 后端：`cd server && cp .env.example .env && npm install && npm run seed && npm start`
- 前端：`npm run dev:h5`（确保 CORS 允许，API 指向后端）

## 健康检查
- `/api/health/live`（活性）；`/api/health/ready`（就绪）
- 响应头 `X-Request-Id` 用于日志关联

## 报表留存
- 导出：`cd server && npm run report`（默认上月）
- S3 上传：配置 `S3_*` 环境变量后自动上传

## 压测
- Artillery：`npx artillery run tests/load/artillery.yml`
- k6：`k6 run -e BASE_URL=... tests/load/k6.js`

## 备份/恢复
- 见 `docs/BACKUP_RESTORE.md`

## Sealos 部署要点
- 环境注入：Secret/Config；探针：live/ready
- 日志：stdout 聚合；Cron 定时月报
- 资源：requests/limits 与弹性扩容
