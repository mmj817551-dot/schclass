# 报表导出与留存

## 导出接口
- `GET /api/reports/monthly?month=YYYY-MM&format=csv|pdf`（管理员）
- CSV/PDF 文件名：`YYYY-MM_report.ext`

## 自动化留存
- 脚本：`node server/src/scripts/report-cron.js [YYYY-MM]`
  - 默认导出上一个自然月
  - 输出到 `./reports/YYYY-MM/`
- 对象存储（可选）
  - 环境变量：`S3_ENDPOINT,S3_REGION,S3_ACCESS_KEY_ID,S3_SECRET_ACCESS_KEY,S3_BUCKET,S3_PREFIX`
  - 需安装：`@aws-sdk/client-s3`（待批准后安装）
  - 若未配置 S3，将仅落地到本地目录

## Sealos CronJob 示例（伪代码）
```
apiVersion: batch/v1
kind: CronJob
metadata:
  name: monthly-report
spec:
  schedule: "0 1 1 * *" # 每月1日1点
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: reporter
              image: node:24
              command: ["node","server/src/scripts/report-cron.js"]
              env:
                - name: MONGO_URI
                  value: "<your mongo uri>"
                - name: S3_BUCKET
                  value: "<bucket>"
                # ... 其余S3变量
          restartPolicy: OnFailure
```

