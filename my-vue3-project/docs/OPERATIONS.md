# 运行与运维手册

## 后端
- 目录：`server/`
- 启动：`npm start`（默认端口 3000）
- 环境变量：见 `server/.env.example`
- 健康检查：`/api/health/live`（活性），`/api/health/ready`（就绪）
- 日志：morgan 访问日志，错误走统一中间件，响应头含 `X-Request-Id`

## 前端（H5）
- 开发：`npm run dev:h5`
- 打包：`npm run build:h5`
- 后端 API 基址：`/api`（CORS 允许）

## 报表留存（自动化）
- 脚本：`node server/src/scripts/report-cron.js [YYYY-MM]`
  - 不传月份默认导出上一个自然月
  - 输出到 `./reports/YYYY-MM/`
  - 若配置 S3（S3_ENDPOINT/REGION/AK/SK/BUCKET），将上传到对象存储（前缀 `S3_PREFIX`）
- 定时：建议使用 Sealos CronJob 或 CI 定时流水线

## 安全与权限
- JWT：登录返回 Bearer Token，过期/伪造 → 401
- 角色：教师/学生/管理员，越权 → 403
- 速率限制：全局默认 200/min，可按需细化

