# 项目运行与打开方式（总指南）

## 1. 目录概览
- 前端：`src/`（uni-app H5）
- 后端：`server/`（Node + Express + Mongo）
- 文档：`docs/`
- 压测：`tests/load/`

## 2. 启动后端
- 进入后端目录：`cd server`
- 复制环境模板：`cp .env.example .env` 并填写 `MONGO_URI`、`JWT_SECRET` 等
- 安装依赖：`npm install`
- 初始化种子数据：`npm run seed`
- 启动服务：`npm start`（默认 `http://localhost:3000`）

## 3. 启动前端（H5）
- 运行：`npm run dev:h5`
- 确认前端 `/api` 指向后端；CORS 已允许

## 4. 健康检查与指标
- 活性：`GET /api/health/live`
- 就绪：`GET /api/health/ready`
- 指标：`GET /metrics`（Prometheus 文本格式）

## 5. 联调与报表
- 联调脚本：`docs/api-check.http`（VS Code REST Client）
- 报表导出：管理员访问 `GET /api/reports/monthly?month=YYYY-MM&format=csv|pdf`
- 自动化导出：在 `server/` 执行 `npm run report`（默认导出上月；配置 `S3_*` 可自动上传）

## 6. 压测（可选）
- Artillery：`npx artillery run tests/load/artillery.yml`
- k6：`k6 run -e BASE_URL=http://localhost:3000/api tests/load/k6.js`

## 7. 部署（Sealos）
- 样例 YAML：`docs/deploy/sealos-deployment.yaml`、`docs/deploy/sealos-cronjob.yaml`
- 建议：以 Secret/Config 注入环境；配置 Ingress/TLS；开启健康探针与资源限制

## 8. 其他文档
- 运行/运维：`docs/OPERATIONS.md`
- 备份/恢复：`docs/BACKUP_RESTORE.md`
- 种子与管理员：`docs/SEEDING.md`
- 报表与留存：`docs/REPORTS.md`
- 验收清单：`docs/ACCEPTANCE_CHECKLIST.md`

