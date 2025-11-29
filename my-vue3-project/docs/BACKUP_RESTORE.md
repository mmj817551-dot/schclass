# 备份与恢复

## 备份（建议每日定时）
```
mongodump --uri="$MONGO_URI" --archive=/backup/backup_$(date +%Y%m%d).gz --gzip
```

## 恢复（注意 --drop 覆盖）
```
mongorestore --uri="$MONGO_URI" --archive=/backup/backup_YYYYMMDD.gz --gzip --drop
```

## 关键集合
- Users, Bindings, Rooms, Reservations, Occupancy, Config

## 保留策略
- 日全量：保留 7 天
- 月全量：保留 12 个月

