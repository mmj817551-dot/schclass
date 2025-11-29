# 种子数据与管理员

## 种子脚本
- 路径：`server/src/scripts/seed.js`
- 作用：初始化 Config（subjects、capacity、weekStart、timezone）与 7 小 + 1 大 教室
- 运行：
```
cd server
npm run seed
```

## 管理员账号
- 设置环境变量后运行种子脚本可创建管理员：
  - `ADMIN_PHONE=13900099999`
  - `ADMIN_PASSWORD=P@ssw0rd`
- 登录管理员后可修改配置、导出报表

