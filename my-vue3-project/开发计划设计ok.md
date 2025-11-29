### 开发计划设计

用户:
项目开发：我正在使用uni-app开发一款教师排课系统，使用的是vue3+js，数据库使用mango，采用sealos云开发的形式，现在你需要帮助我制定开发计划：1.设计整个项目的前端界面和后端逻辑代码，后续我会交给codex来编写；2.解析功能并规划项目文件目录，需要注明设计思路和每个文件的作用，要求按模块和组件来制定项目框架以保证每个功能单元和组件的独立性，同时前端我会使用一些前端按钮或加载页面组件，存放在io-moudules文件夹内，包括按钮，卡片，输入框，加载动画，时间组件等，请在设计前端时使用它们；3.后端功能我将稍后为你写明，前端界面风格要求模拟苹果公司的界面，采用简洁平滑舒适的风格和手感，背景使用温和纯白色系。功能介绍：我们需要一个注册界面、登录界面、系统界面和个人界面；注册界面：每个教师和学生都可以进行注册，配置一个转换按钮转换角色，要求教师输入姓名，手机号，密码，确认密码，科目；要求学生输入姓名，手机号，密码，确认密码；登录界面：注册成功后即可在登录界面登录系统，登录界面的设计类似于注册界面；系统界面：系统界面包括7件小教室和一件大教室，教师数量设计成可变数量，和前端组件绑定，如果教室数量变动仅在后端改变数字即可增减教室。每个教室用卡片的形式表示，包含教室名、五个时间段、每个时间段是否被预约（每天分别设置为五个时间段，即早1，早2，下1，下2，晚1；如果某时间段被预约，可进一步点击打开详情查看预约信息：包括预约老师名字、预约科目、预约学生名字、预约具体时间段以及备注）。进入系统界面后，教师可以进行排课，即我们有七件小教室和一件大教室（教室的数量以后可能会变更），教师可以在空闲时间段安排课程在某间教室，被使用的教室不能在指定时间内再被其他教师预约；限定预约科目为：语文，数学，英语，物理，化学，生物，地理，政治，历史；每件教室的预约时间由教师决定，在时间选择处采用iphone的闹钟界面设计（平滑滑动选择早1、早2、下1、下2、晚1五个选项，可以使用io-moudules的time组件）；每次预约都需要选择学生名（和教师的个人界面共用数据，采用选择学生名选项的形式而不是直接输入）；每个教室被预约后需要在界面展示被预约，如果进一步点击被预约教室，可展示老师和学生以及科目名称的具体信息，所有用户均可视；此外，课程预约记录必须保留在数据库，以表格形式整理并每个月打印一次给超级管理员；每件小教室只可以预约一位学生，大教室可预约最多10名学生；个人界面：教师的个人界面需要展示教师的姓名、科目、名下的学生名、学生手机号的信息，学生的个人界面需要展示姓名、本周的安排课程情况和历史课程记录，在课程情况和历史课程记录中包含上课时间段、授课教师姓名、科目等信息。教师需要在个人界面输入学生姓名，向该学生发出连接申请，学生在自己的个人界面点击同意后，该学生正式和该教师绑定在一起，并且该教师可以在自己的预约功能的学生姓名选项中找到该学生的信息，才可以完成预约。没有完成绑定的学生，该教师不可预约。如有其他能提升用户体验的前后端策略，你也可以擅自做主添加。接下来请设计一整套开发流程，按照先前端再后端的步骤逐步进行，并在中间设计好前端需要哪些后端接口。
用户:


**设计师生绑定**

借助请求绑定的设计方式，确保只有绑定的学生才能进行预约，从而提升师生管理的整体效率。

**规划定时选项**

通过教师选择固定时间段，我在开发阶段制定了毕业设计，确保前端集成和后端逻辑的高效配合。

**探索技术栈**

考虑使用uni-app，整合io-modules，设计灵感来源于iOS的界面风格，确保代码精细并无误。

**整合模组方案**

通过结合身份验证、系统排班、个人页面和后台管理，确保前端与后端的无缝对接，高效实现预约、联系和通知功能。

**统一前端管理**

我正在整合Pinia进行状态管理，确保使用搭载io模块的加载页面功能，并且正在绘制前端模块的图示。
AI助手:
下面是一份**可直接交给 Codex 开干**的完整开发计划与项目框架（uni-app + Vue3 + JS，数据库 MongoDB，Sealos 云开发）。我按“先前端后后端”的顺序展开，并把**前端所需的后端接口**在中间明确列出。整套方案强调**模块化/组件化**与**苹果风（简洁、顺滑、细腻）**，并明确使用你给的 **`/src/io-moudules`** 中的通用 UI 组件（按钮、卡片、输入、加载、时间组件等）。

---

## 0) 全局假设与目标

- **运行环境**：uni-app（H5 为主，后续可扩展小程序），Vue3 + `<script setup>` + JS。状态管理用 Pinia。
- **数据库**：MongoDB（你文中写 “mango”，此处按 MongoDB 设计）。
- **云**：Sealos（容器化后端 + 托管 MongoDB + 定时任务）。
- **角色**：`teacher`、`student`、`superAdmin`（用于月度报表下载与配置）。
- **时间段枚举**：`['早1','早2','下1','下2','晚1']`。
- **科目枚举**：`['语文','数学','英语','物理','化学','生物','地理','政治','历史']`。
- **教室**：默认 7 间小教室 + 1 间大教室（容量 10），数量随后端配置增减。
- **设计风格**：苹果风（白底 + 柔和阴影 + 大圆角 + 毛玻璃模态 + 轻量动效）。

---

## 1) 前端设计（UI/UX、页面、组件、状态、目录）

### 1.1 设计语言（苹果风实现要点）
- **色彩**：背景纯白 #FFFFFF；文本深灰 #111；辅助灰 #8E8E93；强调色使用系统蓝 #007AFF（H5 可自定义变量）。
- **圆角与阴影**：卡片 `border-radius: 20px`；阴影轻柔（例如 `0 8px 30px rgba(0,0,0,0.04)`）。
- **动效**：按钮按下有轻微缩放（`transform: scale(0.98)`），列表滑入淡入，模态层毛玻璃（`backdrop-filter: saturate(180%) blur(20px)`）。
- **组件来源**：**所有基础交互**（按钮/卡片/输入/加载/时间选择）统一来自 **`/src/io-moudules`**，保证风格一致。

### 1.2 页面与路由
- `/pages/auth/Register` —— **注册**（教师/学生切换）
- `/pages/auth/Login` —— **登录**
- `/pages/home/System` —— **系统（教室）**：默认显示“今天”的所有教室卡片 + 每间教室 5 个时间段状态；可切换日期。
- `/pages/profile/Teacher` —— **教师个人页**：基本信息 + 我的学生（绑定/解绑/待确认）+ 我本周安排 + 历史记录。
- `/pages/profile/Student` —— **学生个人页**：基本信息 + 本周安排 + 历史记录 + 待确认绑定请求。
- `/pages/admin/Reports`（可选）—— **超级管理员报表/配置**：导出月报、配置教室数量、容量、科目等（仅 `superAdmin` 可见）。

> uni-app `pages.json` 中配置路由；登录后依据角色导航到相应个人页；系统页从底部 Tab 进入。

### 1.3 组件划分（与 `/src/io-moudules` 协同）
> 仅列出**业务组件**（基础组件从 `io-moudules` 引入）

- `components/nav/AppNavBar.vue` 顶部导航（标题/返回/个人入口）
- `components/nav/AppTabBar.vue` 底部 Tab（系统 / 个人 / 管理）
- `components/room/RoomCard.vue` **教室卡片**（使用 `io-moudules/Card`），展示：教室名 + 5 时段状态点；点击时段 -> 打开预约/详情
- `components/room/TimeSlotBadge.vue` 时段小标（空闲/占用/加载中）
- `components/reservation/ReservationSheet.vue` **预约抽屉/模态**（毛玻璃），字段：
  - 学科（`SubjectSelector.vue`）
  - 时间段（使用 `io-moudules/Time` 的 iPhone 闹钟样式）
  - 选择学生（`StudentPicker.vue`，仅教师绑定过的学生可选，小教室限制 1，大教室最多 10）
  - 备注
- `components/reservation/ReservationDetailModal.vue` **预约详情**（老师名/科目/学生名单/时段/备注）
- `components/common/EmptyState.vue` 空态页（引导用户先去绑定学生或创建预约）
- `components/profile/TeacherCard.vue` 教师信息卡
- `components/profile/StudentCard.vue` 学生信息卡
- `components/profile/BindRequestItem.vue` 绑定申请条目（同意/拒绝）
- `components/schedule/WeeklySchedule.vue` 周视图（按 5 时段*7 天格子，列表或表格）
- `components/selectors/SubjectSelector.vue` 学科选择器（枚举 + 搜索）
- `components/selectors/StudentPicker.vue` 选择学生（支持多选仅当大教室）
- `components/report/MonthExportPanel.vue` 月度报表导出（仅 admin）
  
> **所有按钮/输入/卡片/加载/时间控件**均从 `/src/io-moudules` 引入，例如：
```vue
<script setup>
import IoButton from '@/io-moudules/Button.vue'
import IoCard   from '@/io-moudules/Card.vue'
import IoInput  from '@/io-moudules/Input.vue'
import IoTime   from '@/io-moudules/Time.vue'
import IoLoading from '@/io-moudules/Loading.vue'
</script>
```

### 1.4 前端状态（Pinia）
- `store/auth.js`：用户信息（token、role、profile）
- `store/rooms.js`：教室列表、当天/所选日期的时段占用状态
- `store/reservations.js`：当前筛选条件、预约创建/取消流程状态
- `store/profile.js`：教师/学生个人信息、绑定关系、历史记录
- `store/ui.js`：全局加载、吐司提示、模态显隐

### 1.5 目录结构（前端）
```
/src
  /pages
    /auth
      Login.vue
      Register.vue
    /home
      System.vue
    /profile
      Teacher.vue
      Student.vue
    /admin
      Reports.vue
  /components
    /nav
      AppNavBar.vue
      AppTabBar.vue
    /room
      RoomCard.vue
      TimeSlotBadge.vue
    /reservation
      ReservationSheet.vue
      ReservationDetailModal.vue
    /profile
      TeacherCard.vue
      StudentCard.vue
      BindRequestItem.vue
    /schedule
      WeeklySchedule.vue
    /selectors
      SubjectSelector.vue
      StudentPicker.vue
    /common
      EmptyState.vue
  /io-moudules           # 你提供的通用UI组件目录（直接使用）
    Button.vue
    Card.vue
    Input.vue
    Loading.vue
    Time.vue
    ...
  /services               # API 封装
    http.js               # 基于 uni.request 的封装（拦截器/鉴权/错误处理）
    auth.api.js
    users.api.js
    rooms.api.js
    reservations.api.js
    bindings.api.js
    reports.api.js
    config.api.js
  /store
    index.js              # createPinia
    auth.js
    rooms.js
    reservations.js
    profile.js
    ui.js
  /composables
    useAuth.js
    useRooms.js
    useReservations.js
    useToast.js
  /utils
    constants.js          # SUBJECTS、TIME_SLOTS 枚举
    validators.js
    formatters.js         # 日期/时段映射
    permissions.js
  /styles
    variables.css         # 色值/圆角/阴影/字号等
    globals.css           # 基础排版、滚动优化
App.vue
main.js
pages.json               # uni-app 路由配置
uni.scss                 # 全局样式变量
```

### 1.6 核心页面原型（逻辑）
**注册页**
- 顶部角色切换（`teacher` / `student`），对应显示字段：
  - `teacher`：姓名、手机号、密码、确认密码、**科目**（必选）
  - `student`：姓名、手机号、密码、确认密码
- 校验：手机号格式、密码一致性、必填项
- 调用接口：`POST /auth/register`

**登录页**
- 手机号 + 密码
- 成功后拉取 `GET /users/me`，路由到 System 或个人页

**系统页（教室列表）**
- 顶部：日期选择（默认今天）
- 网格卡片：每间教室一张卡（`RoomCard`），展示 5 个时段的状态（空闲 / 已约 / 容量剩余）
- 点击空闲时段：打开 `ReservationSheet`（教师端）
- 点击已约时段：打开 `ReservationDetailModal`（所有用户可见）
- 动态教室：来自 `GET /rooms`（后端配置），无需前端改代码

**教师个人页**
- 显示姓名、科目
- **我的学生**：已绑定（姓名+手机号），**发起绑定**（输入学生姓名 -> 选中具体学生 -> 发起请求）
- **待确认列表**（自己发送的、别人来的？教师只需要看自己发出的状态；学生端看待确认）
- **本周安排**（`GET /reservations/my?week=...&role=teacher`）
- **历史记录**（支持时间范围筛选）
- 解绑学生（可选）

**学生个人页**
- 显示姓名
- **待确认绑定请求**列表（`BindRequestItem`，同意/拒绝）
- **本周安排** / **历史记录**（含时段/教师/科目）

**管理员页（可选）**
- 配置教室数量/类型/容量（大教室容量 10，小教室 1）
- 按月份导出报表（CSV/PDF）

---

## 2) 前端 ⇆ 后端接口契约（给 Codex 的“对接单”）

> 约定：所有响应统一 `{ code: 0, data: ..., message: '' }`，失败 `code != 0`。需要鉴权的接口要求 `Authorization: Bearer <token>`。

### 2.1 鉴权
- **注册** `POST /auth/register`
  - `body(teacher)`：`{ role:'teacher', name, phone, password, subject }`
  - `body(student)`：`{ role:'student', name, phone, password }`
  - 返回：`{ token }`
- **登录** `POST /auth/login`
  - `body`：`{ phone, password }`
  - 返回：`{ token }`
- **当前用户** `GET /users/me`  
  - 返回：`{ _id, role, name, phone, subject?, students?[] }`

### 2.2 用户与绑定
- **搜索学生** `GET /users/students/search?name=张三&phone=...`（教师发起绑定时用）
  - 返回：`[{ _id, name, phone }]`
- **发起绑定** `POST /bindings`
  - `body`：`{ studentId }`
  - 返回：`{ bindingId, status:'pending' }`
- **学生查看待处理** `GET /bindings/pending`
  - 返回：`[{ _id, teacher:{_id,name,subject}, createdAt }]`
- **学生同意/拒绝** `PATCH /bindings/{id}`
  - `body`：`{ action:'accept' | 'reject' }`
  - 返回：`{ status }`
- **我的学生**（教师端）`GET /teachers/{id}/students`
  - 返回：`[{ _id,name,phone }]`

### 2.3 教室与配置
- **教室列表** `GET /rooms`
  - 返回：`[{ _id, name, type:'small'|'large', capacity }]`
- **某日占用** `GET /rooms/{id}/reservations?date=YYYY-MM-DD`
  - 返回：`[{ slot, reserved: boolean, restCapacity, reservationId? }]`
- **系统配置** `GET /config`（可变教室数量/容量/科目列表）
- **（管理）更新配置** `PATCH /config`（仅 superAdmin）

### 2.4 预约
- **创建预约** `POST /reservations`
  - `body`：
    ```json
    {
      "roomId": "...",
      "date": "2025-11-17",
      "slot": "早1",
      "subject": "数学",
      "studentIds": ["s1"]  // 大教室可 1~10，小教室必须 1
      ,"remark": "可选"
    }
    ```
  - 规则：  
    1) 教师必须与所有 studentIds 已绑定；  
    2) 教室在该日该时段未被占满（小教室容量=1，大教室<=10）；  
    3) 同一教师**同一时段**不可在不同教室重复预约（防冲突）。  
  - 返回：`{ reservationId }`
- **预约详情** `GET /reservations/{id}`
- **取消预约** `DELETE /reservations/{id}`（教师本人或管理员）
- **按日视图** `GET /reservations?date=YYYY-MM-DD`（系统页刷新）
- **我的安排** `GET /reservations/my?week=2025-W47&role=teacher|student`
- **历史记录** `GET /reservations/history?from=YYYY-MM-DD&to=YYYY-MM-DD&role=...`

### 2.5 报表
- **月度汇总** `GET /reports/monthly?month=2025-11&format=csv|pdf`
  - 返回文件下载链接或二进制流
- **（可选）自动生成**：后端 Cron 每月 1 号 00:30 生成上月报表，供超级管理员下载

---

## 3) 前端交互流程（关键用例）

### 3.1 教师发起绑定 → 学生同意
1. 教师在个人页点击“添加学生”，输入关键词，`GET /users/students/search`
2. 选中某学生 `POST /bindings`
3. 学生登录在个人页“待确认”，`GET /bindings/pending`
4. 学生点击同意 `PATCH /bindings/{id} { action:'accept' }`
5. 教师端“我的学生”刷新，之后在预约时 `StudentPicker` 可选该学生

### 3.2 创建预约（教师）
1. 系统页选择某教室某日期，点击空闲时段 → 打开 `ReservationSheet`
2. 选择科目（默认教师科目）、选择学生（小教室仅 1，大教室可多，<= 容量）、备注
3. `POST /reservations` 成功后：  
   - 关闭抽屉，刷新当前教室 `GET /rooms/{id}/reservations?date=...`  
   - 全局吐司 “已预约”
4. 点击已约时段 → `GET /reservations/{id}` → `ReservationDetailModal` 展示详情

### 3.3 学生查看安排
- 学生个人页 → `GET /reservations/my?week=...&role=student` 渲染 `WeeklySchedule`
- 历史记录分页加载

---

## 4) 后端设计（技术栈、数据模型、业务规则、并发）

### 4.1 技术栈与结构
- Node.js + Express（或 Koa）+ Mongoose
- JWT 鉴权，Bcrypt 密码哈希
- 输入校验（celebrate/Joi 或 zod）
- 统一错误处理中间件
- 速率限制（登录/注册）
- 日志（winston + 持久化到文件/ELK）
- 目录结构（后端）
```
/server
  /src
    app.js
    /config
      env.js
      db.js
    /models
      User.js
      Room.js
      Reservation.js
      Binding.js
      Config.js
    /routes
      auth.routes.js
      users.routes.js
      rooms.routes.js
      reservations.routes.js
      bindings.routes.js
      reports.routes.js
      admin.routes.js
    /controllers
      authController.js
      userController.js
      roomController.js
      reservationController.js
      bindingController.js
      reportController.js
    /middlewares
      auth.js          # 解析JWT、注入 req.user
      rbac.js          # 角色鉴权
      validate.js      # 请求体验证
      error.js         # 统一错误输出
      rateLimit.js
    /services
      reservationService.js # 并发/冲突处理
      reportService.js
      notificationService.js # 可扩展
    /utils
      constants.js     # SUBJECTS、TIME_SLOTS
      logger.js
    /cron
      monthlyReport.js
```

### 4.2 数据模型（MongoDB + 索引）
**User**
```js
{
  _id,
  role: 'teacher'|'student'|'superAdmin',
  name, phone: { unique: true }, passwordHash,
  subject?: '语文'|... ,   // 仅 teacher
  students?: [ObjectId],   // teacher 快速查询，也可实时聚合
  createdAt, updatedAt
}
```

**Binding（教师-学生绑定关系）**
```js
{
  _id, teacherId, studentId,
  status: 'pending'|'accepted'|'rejected',
  createdAt, updatedAt
}
// 复合唯一：同一教师-学生仅一条有效关系
db.bindings.createIndex({teacherId:1, studentId:1}, {unique:true})
```

**Room（教室配置）**
```js
{
  _id, name, type: 'small'|'large', capacity: Number, order: Number
}
```

**Reservation（预约）**
```js
{
  _id,
  roomId, date: 'YYYY-MM-DD', slot: '早1'|'早2'|'下1'|'下2'|'晚1',
  teacherId, subject,
  studentIds: [ObjectId],      // small:1; large:1..capacity
  remark,
  createdAt, updatedAt
}
// 防止同一教室同一日同一时段被重复占用
db.reservations.createIndex({ roomId:1, date:1, slot:1 }, { unique: true })
// 防止同一教师同一日同一时段在不同教室重复排课
db.reservations.createIndex({ teacherId:1, date:1, slot:1 }, { unique: true })
```

**Config（系统配置）**
```js
{
  _id: 'global',
  subjects: ['语文',...],
  timeSlots: ['早1','早2','下1','下2','晚1'],
  // 也可冗余存储教室数量等，但推荐以 Room 集合为准
}
```

### 4.3 业务规则（服务层保证）
- 预约前校验：
  1) `teacherId` 与 `studentIds` 均存在 **accepted** 绑定；
  2) `subject` ∈ `Config.subjects`；
  3) 目标 `roomId` 在 `date+slot` 未占用（或未达容量）；  
     - **实现方式**：`roomId+date+slot` 唯一索引已经避免并发重复。如果大教室容量为 10 且允许多人同段占同室，则可存储为**一条 Reservation** 内含 `studentIds` 数组，不再允许多条 Reservation 共享同一 `roomId+date+slot`。教师增/减学生时更新同一条 Reservation 的 `studentIds`，并设置 `unique` 索引确保唯一性与幂等。
  4) 同一教师 `teacherId+date+slot` 唯一（防止跨教室冲突，索引已保证）。
- 小教室：`studentIds.length === 1`；大教室：`1 <= length <= capacity`。
- 取消预约：仅创建者（教师）或管理员可取消。
- 详情可见性：所有登录用户可见（需求如此）。

### 4.4 并发与一致性（关键伪代码）
```js
// reservationService.create()
withTransaction(async (session) => {
  // 1. 校验绑定
  assert(all studentIds are accepted with teacherId)

  // 2. 查当前配置与教室
  const room = await Room.findById(roomId).session(session)

  // 3. 教师同段防重（依赖唯一索引，也可先查）
  // 4. 试图插入唯一占位记录（roomId+date+slot）
  //    我们设计：同一时段同一教室只有一条Reservation，学生列表在数组中
  //    若不存在：创建
  //    若存在：
  //        - 若同一教师：合并/替换学生列表（需满足容量与绑定）
  //        - 若不同教师：拒绝（“该教室该时段已被其他教师占用”）

  const existing = await Reservation.findOne({roomId, date, slot}).session(session)
  if (!existing) {
    // 新建（小教室 len=1；大教室 <= capacity）
    await Reservation.create([{roomId, date, slot, teacherId, subject, studentIds, remark}], { session })
  } else {
    if (!existing.teacherId.equals(teacherId)) throw ConflictError('被其他教师占用')
    // 同教师更新学生列表
    const merged = uniq([...existing.studentIds, ...studentIds])
    if (room.type==='small' && merged.length>1) throw CapacityError()
    if (room.type==='large' && merged.length>room.capacity) throw CapacityError()
    await Reservation.updateOne({_id: existing._id}, {$set: { studentIds: merged, subject, remark }}, { session })
  }
})
```

---

## 5) 前端实现细节（关键代码骨架）

### 5.1 请求封装 `/src/services/http.js`
```js
// 统一拦截器：加 Authorization，错误码弹 Toast
export function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      header: {
        ...options.header,
        Authorization: `Bearer ${uni.getStorageSync('token') || ''}`
      },
      success: ({ data, statusCode }) => {
        if (statusCode >= 200 && statusCode < 300 && data.code === 0) resolve(data.data)
        else reject(data || { message: 'Network Error', code: -1 })
      },
      fail: reject
    })
  })
}
```

### 5.2 预约抽屉使用 `io-moudules/Time`
```vue
<!-- ReservationSheet.vue（片段） -->
<script setup>
import IoTime from '@/io-moudules/Time.vue'
import IoButton from '@/io-moudules/Button.vue'
import SubjectSelector from '@/components/selectors/SubjectSelector.vue'
import StudentPicker from '@/components/selectors/StudentPicker.vue'
import { createReservation } from '@/services/reservations.api.js'

const form = reactive({
  subject: '',
  slot: '早1',
  studentIds: [],
  remark: ''
})
const submit = async () => {
  await createReservation({
    roomId: props.roomId,
    date: props.date,
    slot: form.slot,
    subject: form.subject,
    studentIds: form.studentIds,
    remark: form.remark
  })
  emit('success')
}
</script>

<template>
  <div class="sheet">
    <SubjectSelector v-model="form.subject" />
    <IoTime v-model="form.slot" :options="['早1','早2','下1','下2','晚1']" />
    <StudentPicker v-model="form.studentIds" :roomType="props.roomType" :capacity="props.capacity" />
    <IoButton @click="submit">确认预约</IoButton>
  </div>
</template>
```

### 5.3 状态与加载（苹果风细节）
- 列表请求前显示 `io-moudules/Loading` 骨架；
- 操作成功/失败使用系统样式吐司；
- 模态、抽屉均有柔和过渡。

---

## 6) 报表与打印（每月一次）

- 聚合维度：日期、教室、时段、教师、科目、学生名单、备注。
- 输出：CSV（默认）+ PDF（选配）。
- **接口**：`GET /reports/monthly?month=YYYY-MM&format=csv|pdf`  
  - 管理端页面提供“导出本月”“导出上月”便捷按钮。
- **定时任务（可选）**：Sealos Cron 每月 1 日 00:30 生成上月报表，保存在对象存储，返回下载链接；管理员页列出可下载清单。

---

## 7) 权限与安全

- **JWT**：登录后发放；`superAdmin` 具备管理接口权限。
- **RBAC**：中间件 `rbac(['teacher'])` / `rbac(['student'])` / `rbac(['superAdmin'])`。
- **输入校验**：手机号正则、密码长度、枚举校验（科目/时段）。
- **防刷**：注册/登录路由限流；关键写入路由（预约）限流 + 幂等设计（唯一索引）。
- **隐私**：`/reservations/{id}` 返回必要字段；不泄漏非相关手机号（仅在绑定关系内显示）。

---

## 8) 部署与配置（Sealos）

1. **MongoDB**：创建数据库与用户，设置 `MONGODB_URI`。
2. **后端服务**：容器化（Dockerfile）部署到 Sealos；环境变量：
   - `MONGODB_URI`、`JWT_SECRET`、`REPORT_BUCKET`（若生成文件）
3. **前端 H5**：`uni build -h5`，静态资源托管；编译时写入 API 基础地址。
4. **域名/HTTPS**：配置反向代理，开启 HTTPS。
5. **Cron**：Sealos 定时任务触发 `monthlyReport.js`。

---

## 9) 测试计划

- **单元测试**：服务层（绑定校验、容量校验、冲突检测）。
- **接口测试**：Postman/Thunder Client 覆盖主要接口与错误分支。
- **E2E 测试**：登录 → 绑定 → 预约 → 取消 → 导出报表。
- **并发测试**：同一教室同一时段并发预约、同一教师跨教室并发预约（确保唯一索引生效）。
- **回归用例**：教室数量/容量变更后，前端系统页自动适配。

---

## 10) 可提升体验的加分策略

- **实时刷新**：SSE/WebSocket 推送预约变更，系统页状态秒级同步（可选）。
- **快捷预约**：教师个人页“最近使用的教室/时段/学生”一键复用。
- **周视图快速切换**：系统页顶部“今天 / 明天 / 本周”快捷 tab。
- **离线兜底**：读缓存显示上次数据，网络恢复后更新。
- **可访问性**：大字号友好、触控可点击区域 ≥ 44pt。

---

## 11) 后端关键代码骨架（示例，便于 Codex 展开）

**路由片段 `reservations.routes.js`**
```js
router.post('/reservations', auth, rbac(['teacher']), validate(createReservationSchema), reservationController.create)
router.get('/reservations/:id', auth, reservationController.detail)
router.delete('/reservations/:id', auth, reservationController.cancel)
router.get('/rooms/:id/reservations', auth, reservationController.roomDayView)
router.get('/reservations/my', auth, reservationController.mySchedule)
router.get('/reservations/history', auth, reservationController.history)
```

**服务片段 `reservationService.js`（见上并发伪代码）**

**校验枚举 `utils/constants.js`**
```js
exports.SUBJECTS = ['语文','数学','英语','物理','化学','生物','地理','政治','历史']
exports.TIME_SLOTS = ['早1','早2','下1','下2','晚1']
```

---

## 12) 验收清单（Done = √）

- √ 注册/登录（双角色），教师含科目  
- √ 绑定流程（教师发起、学生同意）  
- √ 系统页按“日期→教室卡→5 时段”浏览  
- √ 预约创建/查看/取消：  
  - 小教室仅 1 学生，大教室 ≤10  
  - 同一时段教师不可跨教室  
  - 被占用教室不可被其他教师再占  
- √ 个人页（教师/学生）周视图 + 历史  
- √ 月度报表导出（CSV / PDF 可选），管理员可下载  
- √ 教室数量/容量后端可配置，前端自动适配  
- √ 所有基础组件均来自 `/src/io-moudules`，风格统一为苹果风

---

如需，我也可以把**接口的 JSON 示例响应**与**更详细的 Mongoose Schema**逐条展开（包括 Joi 校验与错误码约定），再补充一版“**按文件生成器模版**”的清单，便于 Codex 直接产代码。

用户:
把接口的 JSON 示例响应与更详细的 Mongoose Schema逐条展开（包括 Joi 校验与错误码约定），再补充一版按文件生成器模版，根据刚刚的规划和设计，基于我上传的项目包进行开发流程安排，细节到每一步，输出为细节可执行markdown便于codex进行实现落地。
用户:


**观察项目结构**  
我正在使用 python_user_visible 工具解压项目包，并详细查看其文件夹结构，以便制定详细的开发计划。

**拆解和审查**  
解压项目包后，列出文件内容并审查其结构。接着，开始制定步骤详尽的开发计划。

**详细查看文件**  
解压项目包并浏览目录树，逐步审查文件和文件夹。这让我能够更清晰地了解项目结构。

**标准化文件夹**  
将项目中的文件夹和代码标准化，确保命名一致性和易用性，方便以后维护和升级。

**重新整理文件结构**  
精简文件映射，考虑两级目录。

**查看结构**  
我在检查目录结构，确认src/io-modules目录存在。

**将Vue SFC整合**  
我正在将HTML/CSS目录转换为Vue SFC，并结合现有项目结构制定整合计划。

**规划组件集成**  
我正在决定使用io-modules组件，并计划创建Vue SFC封装这些HTML/CSS模块，确保本地化和适应中文用户。

**整理和计划**  
我正在整理项目结构和文件生成器模版，计划包括API、错误代码、数据模型、校验Schemas定义、接口清单、后端目录结构、前端变更、开发流程步骤和验收 checklist。

**制订后端和服务**  
我正在设立后端服务和前端服务，包括`/server`目录的`package.json`配置、http拦截器、API文件和Pinia商店。同时，调整`pages.json`和`src/services/http.js`文件。
AI助手:
下面是一份**可直接交给 Codex 执行**的、细到文件与代码的落地方案（Markdown 版）。  
我已检查你上传的项目包（路径：`/mnt/data/my-vue-project/my-vue-project`），其中：

- 是 **uni-app + Vite** 项目（`vite.config.js`、`src/pages.json`、`src/main.js`、`src/App.vue` 存在）。
- 你的通用 UI 组件目录为 **`src/io-modules/`**（注意：是 *io-modules*，不是 *io-moudules*），包含：`card/`、`input1/`、`input2/`、`loader/`、`time/`、`changekey/`、`comfirmkey/` 的 **HTML/CSS** 模板资源。  
  => 我们将为这些资源各自提供 **Vue 组件包装器**（`IoCard.vue`、`IoInput.vue`、`IoLoader.vue`、`IoTime.vue` 等），从而在业务界面中“使用 io-modules”。

以下内容按要求提供：
1) **接口 JSON 示例响应**（成功/失败，错误码约定）；  
2) **更详细的 Mongoose Schema**（含索引）；  
3) **逐条 Joi 校验**；  
4) **按文件生成器模版（scaffold）**；  
5) **基于你上传项目的逐步开发流程**（前端先行→后端对接），每一步有可执行文件与片段。

---

# 一、错误码约定（HTTP + 业务码）

- 成功：HTTP 2xx，`{ code: 0, data: ..., message: "" }`
- 失败：HTTP 标准码 + 业务码（`code != 0`）
  
| 分组 | 业务码 | 含义 |
|---|---:|---|
| 验证类 | 40000 | 通用参数错误 |
| 验证类 | 40001 | 字段校验失败（Joi） |
| 鉴权类 | 40101 | 未登录/Token 缺失 |
| 鉴权类 | 40102 | Token 过期/无效 |
| 权限类 | 40301 | 无权限（角色不符） |
| 资源类 | 40401 | 资源不存在 |
| 冲突类 | 40901 | 教室该时段已被其他教师占用 |
| 冲突类 | 40902 | 同教师同一时段跨教室冲突 |
| 约束类 | 42201 | 容量限制超出（大/小教室） |
| 约束类 | 42202 | 绑定关系不存在（教师未绑定该学生） |
| 速率类 | 42901 | 访问过于频繁 |
| 服务类 | 50000 | 服务器内部错误 |

**失败响应统一格式示例：**
```json
{
  "code": 40901,
  "message": "该教室该时段已被其他教师占用",
  "data": null
}
```

---

# 二、API 接口清单与 JSON 示例

> 统一 `Authorization: Bearer <jwt>`（除注册/登录外）。  
> 时间段枚举：`["早1","早2","下1","下2","晚1"]`  
> 科目枚举：`["语文","数学","英语","物理","化学","生物","地理","政治","历史"]`

## 2.1 鉴权

### POST `/auth/register`
- **teacher**：
```json
{
  "role": "teacher",
  "name": "张老师",
  "phone": "13812345678",
  "password": "P@ssw0rd",
  "subject": "数学"
}
```
- **student**：
```json
{
  "role": "student",
  "name": "李明",
  "phone": "13912345678",
  "password": "P@ssw0rd"
}
```
- **成功**：
```json
{
  "code": 0,
  "data": { "token": "jwt-token-string" },
  "message": ""
}
```
- **失败（重复手机号）**：
```json
{
  "code": 40001,
  "message": "手机号已注册",
  "data": null
}
```

### POST `/auth/login`
```json
{
  "phone": "13812345678",
  "password": "P@ssw0rd"
}
```
- **成功**：
```json
{
  "code": 0,
  "data": { "token": "jwt-token-string" },
  "message": ""
}
```
- **失败（账号或密码错误）**：
```json
{
  "code": 40101,
  "message": "手机号或密码错误",
  "data": null
}
```

### GET `/users/me`
- **成功**（教师）：
```json
{
  "code": 0,
  "data": {
    "_id": "u_t_1",
    "role": "teacher",
    "name": "张老师",
    "phone": "13812345678",
    "subject": "数学",
    "students": [
      { "_id": "s1", "name": "李明", "phone": "13900001111" }
    ]
  },
  "message": ""
}
```

## 2.2 用户与绑定

### GET `/users/students/search?name=李&phone=139`
- **成功**：
```json
{
  "code": 0,
  "data": [
    { "_id": "s1", "name": "李明", "phone": "13900001111" },
    { "_id": "s2", "name": "李晓", "phone": "13900002222" }
  ],
  "message": ""
}
```

### POST `/bindings`
```json
{ "studentId": "s1" }
```
- **成功**：
```json
{
  "code": 0,
  "data": { "bindingId": "b1", "status": "pending" },
  "message": ""
}
```
- **失败（重复绑定或存在 pending）**：
```json
{
  "code": 40903,
  "message": "已存在待处理或已绑定关系",
  "data": null
}
```

### GET `/bindings/pending`（学生端）
- **成功**：
```json
{
  "code": 0,
  "data": [
    {
      "_id": "b1",
      "teacher": { "_id": "t1", "name": "张老师", "subject": "数学" },
      "createdAt": "2025-11-10T12:00:00.000Z"
    }
  ],
  "message": ""
}
```

### PATCH `/bindings/{id}`
```json
{ "action": "accept" } // 或 "reject"
```
- **成功（accept）**：
```json
{ "code": 0, "data": { "status": "accepted" }, "message": "" }
```

### GET `/teachers/{id}/students`
```json
{
  "code": 0,
  "data": [
    { "_id": "s1", "name": "李明", "phone": "13900001111" }
  ],
  "message": ""
}
```

## 2.3 教室与配置

### GET `/rooms`
```json
{
  "code": 0,
  "data": [
    { "_id": "r1", "name": "小教室1", "type": "small", "capacity": 1, "order": 1 },
    { "_id": "r8", "name": "大教室",  "type": "large", "capacity": 10, "order": 8 }
  ],
  "message": ""
}
```

### GET `/rooms/{id}/reservations?date=2025-11-17`
```json
{
  "code": 0,
  "data": [
    { "slot": "早1", "reserved": true,  "restCapacity": 0, "reservationId": "rv1" },
    { "slot": "早2", "reserved": false, "restCapacity": 1 },
    { "slot": "下1", "reserved": false, "restCapacity": 1 },
    { "slot": "下2", "reserved": true,  "restCapacity": 0, "reservationId": "rv3" },
    { "slot": "晚1", "reserved": false, "restCapacity": 1 }
  ],
  "message": ""
}
```

### GET `/config`
```json
{
  "code": 0,
  "data": {
    "subjects": ["语文","数学","英语","物理","化学","生物","地理","政治","历史"],
    "timeSlots": ["早1","早2","下1","下2","晚1"]
  },
  "message": ""
}
```

### PATCH `/config`（管理员）
```json
{
  "subjects": ["语文","数学","英语","物理","化学","生物","地理","政治","历史"],
  "timeSlots": ["早1","早2","下1","下2","晚1"]
}
```
- **成功**：
```json
{ "code": 0, "data": true, "message": "" }
```

## 2.4 预约

### POST `/reservations`
```json
{
  "roomId": "r8",
  "date": "2025-11-17",
  "slot": "下2",
  "subject": "数学",
  "studentIds": ["s1","s2"],
  "remark": "期中复习"
}
```
- **成功**：
```json
{ "code": 0, "data": { "reservationId": "rv8" }, "message": "" }
```
- **失败（被其他教师占用）**：
```json
{ "code": 40901, "message": "该教室该时段已被其他教师占用", "data": null }
```
- **失败（容量超出）**：
```json
{ "code": 42201, "message": "大教室最多可预约10名学生", "data": null }
```
- **失败（绑定缺失）**：
```json
{ "code": 42202, "message": "请选择已绑定的学生", "data": null }
```

### GET `/reservations/{id}`
```json
{
  "code": 0,
  "data": {
    "_id": "rv8",
    "room": { "_id": "r8", "name": "大教室" },
    "date": "2025-11-17",
    "slot": "下2",
    "teacher": { "_id": "t1", "name": "张老师" },
    "subject": "数学",
    "students": [
      { "_id": "s1", "name": "李明" },
      { "_id": "s2", "name": "王华" }
    ],
    "remark": "期中复习"
  },
  "message": ""
}
```

### DELETE `/reservations/{id}`
```json
{ "code": 0, "data": true, "message": "" }
```

### GET `/reservations?date=2025-11-17`
- 返回当日所有教室所有时段的占用概要（用于系统页快速刷新）：
```json
{
  "code": 0,
  "data": [
    {
      "roomId": "r1",
      "slots": [
        { "slot": "早1", "reserved": false, "restCapacity": 1 },
        ...
      ]
    },
    {
      "roomId": "r8",
      "slots": [
        { "slot": "早1", "reserved": true, "restCapacity": 7, "reservationId": "rv9" },
        ...
      ]
    }
  ],
  "message": ""
}
```

### GET `/reservations/my?week=2025-W47&role=teacher|student`
```json
{
  "code": 0,
  "data": [
    {
      "date":"2025-11-17","slot":"下2","room":"大教室","subject":"数学",
      "teacher":"张老师","students":["李明","王华"]
    }
  ],
  "message":""
}
```

### GET `/reservations/history?from=2025-10-01&to=2025-10-31&role=student`
```json
{
  "code":0,
  "data":[ /* 同上结构，分页可选 */ ],
  "message":""
}
```

## 2.5 报表

### GET `/reports/monthly?month=2025-11&format=csv|pdf`（管理员）
- **成功**（返回下载链接）：
```json
{
  "code": 0,
  "data": { "url": "https://objects.xxx/reports/2025-11.csv" },
  "message": ""
}
```

---

# 三、Mongoose Schema（详细）

> Node 18 + Mongoose 7，ESM 模块。

```js
// server/src/utils/constants.js
export const SUBJECTS = ['语文','数学','英语','物理','化学','生物','地理','政治','历史'];
export const TIME_SLOTS = ['早1','早2','下1','下2','晚1'];
```

```js
// server/src/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['teacher','student','superAdmin'], required: true, index: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  subject: { type: String, enum: ['语文','数学','英语','物理','化学','生物','地理','政治','历史'] }, // teacher only
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // denormalized for teacher
}, { timestamps: true });

export default mongoose.model('User', userSchema);
```

```js
// server/src/models/Binding.js
import mongoose from 'mongoose';

const bindingSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['pending','accepted','rejected'], default: 'pending', index: true },
}, { timestamps: true });

bindingSchema.index({ teacherId: 1, studentId: 1 }, { unique: true });

export default mongoose.model('Binding', bindingSchema);
```

```js
// server/src/models/Room.js
import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['small','large'], required: true, index: true },
  capacity: { type: Number, required: true, min: 1 },
  order: { type: Number, default: 0, index: true }
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);
```

```js
// server/src/models/Reservation.js
import mongoose from 'mongoose';
import { TIME_SLOTS } from '../utils/constants.js';

const reservationSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  slot: { type: String, enum: TIME_SLOTS, required: true, index: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true }, // limit in validation layer to subjects enum
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  remark: { type: String }
}, { timestamps: true });

// 唯一性与冲突约束：
reservationSchema.index({ roomId: 1, date: 1, slot: 1 }, { unique: true });
reservationSchema.index({ teacherId: 1, date: 1, slot: 1 }, { unique: true });

export default mongoose.model('Reservation', reservationSchema);
```

```js
// server/src/models/Config.js
import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
  _id: { type: String, default: 'global' },
  subjects: [{ type: String }],
  timeSlots: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Config', configSchema);
```

---

# 四、Joi 校验（逐条）

> 使用 `joi` + 自研中间件 `validate(schema)`；手机号正则示例 `^1[3-9]\\d{9}$`。

```js
// server/src/middlewares/validate.js
import Joi from 'joi';

export const validate = (schema) => (req, res, next) => {
  const toValidate = {
    body: req.body,
    params: req.params,
    query: req.query
  };
  const { error, value } = schema.validate(toValidate, { allowUnknown: true, abortEarly: false });
  if (error) {
    return res.status(400).json({ code: 40001, message: error.details.map(d=>d.message).join('; '), data: null });
  }
  // 将验证后的值回写（可选）
  req.body = value.body || req.body;
  req.params = value.params || req.params;
  req.query = value.query || req.query;
  next();
};
```

```js
// server/src/validators/auth.js
import Joi from 'joi';

const phone = Joi.string().pattern(/^1[3-9]\d{9}$/);

export const registerSchema = Joi.object({
  body: Joi.alternatives().try(
    Joi.object({
      role: Joi.string().valid('teacher').required(),
      name: Joi.string().trim().required(),
      phone: phone.required(),
      password: Joi.string().min(6).required(),
      subject: Joi.string().valid('语文','数学','英语','物理','化学','生物','地理','政治','历史').required()
    }),
    Joi.object({
      role: Joi.string().valid('student').required(),
      name: Joi.string().trim().required(),
      phone: phone.required(),
      password: Joi.string().min(6).required()
    })
  )
});

export const loginSchema = Joi.object({
  body: Joi.object({
    phone: phone.required(),
    password: Joi.string().min(6).required()
  })
});
```

```js
// server/src/validators/bindings.js
import Joi from 'joi';
import mongoose from 'mongoose';

const objectId = () => Joi.string().custom((v, helpers) => (mongoose.isValidObjectId(v) ? v : helpers.error('any.invalid')));

export const createBindingSchema = Joi.object({
  body: Joi.object({ studentId: objectId().required() })
});

export const patchBindingSchema = Joi.object({
  params: Joi.object({ id: objectId().required() }),
  body: Joi.object({ action: Joi.string().valid('accept','reject').required() })
});
```

```js
// server/src/validators/rooms.js
import Joi from 'joi';
import mongoose from 'mongoose';
const objectId = () => Joi.string().custom((v, h) => (mongoose.isValidObjectId(v) ? v : h.error('any.invalid')));

export const roomDaySchema = Joi.object({
  params: Joi.object({ id: objectId().required() }),
  query: Joi.object({ date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required() })
});
```

```js
// server/src/validators/reservations.js
import Joi from 'joi';
import mongoose from 'mongoose';
const objectId = () => Joi.string().custom((v, h) => (mongoose.isValidObjectId(v) ? v : h.error('any.invalid')));

export const createReservationSchema = Joi.object({
  body: Joi.object({
    roomId: objectId().required(),
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    slot: Joi.string().valid('早1','早2','下1','下2','晚1').required(),
    subject: Joi.string().valid('语文','数学','英语','物理','化学','生物','地理','政治','历史').required(),
    studentIds: Joi.array().items(objectId()).min(1).required(),
    remark: Joi.string().allow('', null)
  })
});

export const reservationIdSchema = Joi.object({
  params: Joi.object({ id: objectId().required() })
});

export const myScheduleSchema = Joi.object({
  query: Joi.object({
    week: Joi.string().pattern(/^\d{4}-W\d{2}$/).required(),
    role: Joi.string().valid('teacher','student').required()
  })
});

export const dayQuerySchema = Joi.object({
  query: Joi.object({
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required()
  })
});

export const historyQuerySchema = Joi.object({
  query: Joi.object({
    from: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    to: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    role: Joi.string().valid('teacher','student').required()
  })
});
```

```js
// server/src/validators/config.js
import Joi from 'joi';

export const patchConfigSchema = Joi.object({
  body: Joi.object({
    subjects: Joi.array().items(Joi.string()).min(1),
    timeSlots: Joi.array().items(Joi.string()).min(1)
  })
});
```

---

# 五、后端文件生成器模版（Scaffold）

> 在项目根（与你上传的前端同一层的 **my-vue-project** 内）新建 `server/`。以下为**建议文件**与**可直接落地的最小代码骨架**。

### `server/package.json`
```json
{
  "name": "scheduler-server",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js",
    "seed": "node src/scripts/seed.js",
    "report:monthly": "node src/cron/monthlyReport.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dayjs": "^1.11.13",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "helmet": "^7.0.0",
    "joi": "^17.11.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.6.0",
    "morgan": "^1.10.0"
  }
}
```

### `server/src/config/env.js`
```js
export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher-scheduler',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  reportBucket: process.env.REPORT_BUCKET || ''
};
```

### `server/src/config/db.js`
```js
import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri);
  console.log('[MongoDB] connected:', config.mongoUri);
}
```

### `server/src/utils/response.js`
```js
export const ok = (res, data = true) => res.json({ code: 0, data, message: '' });
export const fail = (res, code, message, status = 400, data = null) => res.status(status).json({ code, message, data });
```

### `server/src/middlewares/auth.js`
```js
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { fail } from '../utils/response.js';

export function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return fail(res, 40101, '未登录', 401);
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    return fail(res, 40102, '登录已过期', 401);
  }
}

export function rbac(roles = []) {
  return (req, res, next) => {
    if (!roles.length) return next();
    if (roles.includes(req.user?.role)) return next();
    return fail(res, 40301, '无权限', 403);
  };
}
```

### `server/src/models/*.js`  
> 见「三、Mongoose Schema」。

### `server/src/services/reservationService.js`
```js
import mongoose from 'mongoose';
import Reservation from '../models/Reservation.js';
import Room from '../models/Room.js';
import Binding from '../models/Binding.js';
import { fail } from '../utils/response.js';

export async function createReservation(req, res) {
  const { roomId, date, slot, subject, studentIds, remark } = req.body;
  const teacherId = req.user._id;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // 校验绑定（所有学生与该教师 accepted 绑定）
      const accepted = await Binding.countDocuments({
        teacherId, studentId: { $in: studentIds }, status: 'accepted'
      }).session(session);
      if (accepted !== studentIds.length) {
        throw { status: 422, code: 42202, message: '请选择已绑定的学生' };
      }

      const room = await Room.findById(roomId).session(session);
      if (!room) throw { status: 404, code: 40401, message: '教室不存在' };

      // 查是否存在该教室该日该段预约
      const existing = await Reservation.findOne({ roomId, date, slot }).session(session);
      if (!existing) {
        // 新建预约：同一教室同一时段只允许一条记录
        if (room.type === 'small' && studentIds.length !== 1)
          throw { status: 422, code: 42201, message: '小教室仅可预约1名学生' };
        if (room.type === 'large' && studentIds.length > room.capacity)
          throw { status: 422, code: 42201, message: `大教室最多可预约${room.capacity}名学生` };

        await Reservation.create([{ roomId, date, slot, teacherId, subject, studentIds, remark }], { session });
      } else {
        // 已被占用：仅同一教师可“合并/替换”学生列表
        if (String(existing.teacherId) !== String(teacherId))
          throw { status: 409, code: 40901, message: '该教室该时段已被其他教师占用' };

        // 合并且去重
        const merged = Array.from(new Set([...existing.studentIds.map(String), ...studentIds]));
        if (room.type === 'small' && merged.length > 1)
          throw { status: 422, code: 42201, message: '小教室仅可预约1名学生' };
        if (room.type === 'large' && merged.length > room.capacity)
          throw { status: 422, code: 42201, message: `大教室最多可预约${room.capacity}名学生` };

        await Reservation.updateOne({ _id: existing._id }, { $set: { studentIds: merged, subject, remark } }, { session });
      }
    });

    // 唯一索引会防止同教师同段跨教室：teacherId+date+slot
    return res.json({ code: 0, data: { reservationId: 'OK' }, message: '' });
  } catch (err) {
    const status = err?.status || (err?.code === 11000 ? 409 : 500);
    const code = err?.code || (err?.code === 11000 ? 40902 : 50000);
    const message = err?.message || (err?.code === 11000 ? '同一时段冲突' : '服务器错误');
    return res.status(status).json({ code, message, data: null });
  } finally {
    session.endSession();
  }
}
```

### `server/src/controllers/*Controller.js`（示例）
```js
// server/src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config/env.js';

export async function register(req, res) {
  const { role, name, phone, password, subject } = req.body;
  const exists = await User.findOne({ phone });
  if (exists) return res.status(400).json({ code: 40001, message: '手机号已注册', data: null });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ role, name, phone, passwordHash, subject });
  const token = jwt.sign({ _id: user._id, role: user.role, name: user.name }, config.jwtSecret, { expiresIn: '7d' });
  res.json({ code: 0, data: { token }, message: '' });
}

export async function login(req, res) {
  const { phone, password } = req.body;
  const user = await User.findOne({ phone });
  if (!user) return res.status(401).json({ code: 40101, message: '手机号或密码错误', data: null });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ code: 40101, message: '手机号或密码错误', data: null });

  const token = jwt.sign({ _id: user._id, role: user.role, name: user.name }, config.jwtSecret, { expiresIn: '7d' });
  res.json({ code: 0, data: { token }, message: '' });
}
```

```js
// server/src/controllers/userController.js
import User from '../models/User.js';
import Binding from '../models/Binding.js';

export async function me(req, res) {
  const user = await User.findById(req.user._id).lean();
  if (!user) return res.status(404).json({ code: 40401, message: '用户不存在', data: null });

  if (user.role === 'teacher') {
    // 聚合老师的学生列表
    const binds = await Binding.find({ teacherId: user._id, status: 'accepted' }).populate('studentId','name phone').lean();
    user.students = binds.map(b => ({ _id: b.studentId._id, name: b.studentId.name, phone: b.studentId.phone }));
  }
  delete user.passwordHash;
  res.json({ code: 0, data: user, message: '' });
}

export async function searchStudents(req, res) {
  const { name, phone } = req.query;
  const q = { role: 'student' };
  if (name) q.name = new RegExp(name);
  if (phone) q.phone = new RegExp(phone);
  const list = await User.find(q).select('_id name phone').limit(50).lean();
  res.json({ code: 0, data: list, message: '' });
}
```

```js
// server/src/controllers/bindingController.js
import Binding from '../models/Binding.js';
import User from '../models/User.js';

export async function create(req, res) {
  const teacherId = req.user._id;
  const { studentId } = req.body;
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') return res.status(404).json({ code: 40401, message: '学生不存在', data: null });

  try {
    const doc = await Binding.create({ teacherId, studentId, status: 'pending' });
    res.json({ code: 0, data: { bindingId: doc._id, status: doc.status }, message: '' });
  } catch (e) {
    return res.status(409).json({ code: 40903, message: '已存在待处理或已绑定关系', data: null });
  }
}

export async function pending(req, res) {
  // 学生端查看
  const list = await Binding.find({ studentId: req.user._id, status: 'pending' })
    .populate('teacherId','name subject').lean();
  res.json({ code: 0, data: list.map(x => ({ _id: x._id, teacher: { _id: x.teacherId._id, name: x.teacherId.name, subject: x.teacherId.subject }, createdAt: x.createdAt })), message: '' });
}

export async function patch(req, res) {
  const { id } = req.params;
  const { action } = req.body;
  const bind = await Binding.findById(id);
  if (!bind || String(bind.studentId) !== String(req.user._id)) return res.status(404).json({ code: 40401, message: '请求不存在', data: null });
  bind.status = action === 'accept' ? 'accepted' : 'rejected';
  await bind.save();
  res.json({ code: 0, data: { status: bind.status }, message: '' });
}
```

```js
// server/src/controllers/roomController.js
import Room from '../models/Room.js';
import Reservation from '../models/Reservation.js';

export async function listRooms(req, res) {
  const rooms = await Room.find().sort({ order: 1 }).lean();
  res.json({ code: 0, data: rooms, message: '' });
}

export async function roomDayView(req, res) {
  const { id } = req.params;
  const { date } = req.query;
  const room = await Room.findById(id).lean();
  if (!room) return res.status(404).json({ code: 40401, message: '教室不存在', data: null });

  const slots = ['早1','早2','下1','下2','晚1'];
  const reservations = await Reservation.find({ roomId: id, date }).lean();
  const map = new Map(reservations.map(r => [r.slot, r]));
  const data = slots.map(s => {
    const r = map.get(s);
    if (!r) return { slot: s, reserved: false, restCapacity: room.type === 'small' ? 1 : room.capacity };
    const rest = room.type === 'small' ? 0 : Math.max(0, room.capacity - (r.studentIds?.length || 0));
    return { slot: s, reserved: true, restCapacity: rest, reservationId: r._id };
  });
  res.json({ code: 0, data, message: '' });
}
```

```js
// server/src/controllers/reservationController.js
import Reservation from '../models/Reservation.js';
import { createReservation } from '../services/reservationService.js';

export { createReservation as create };

export async function detail(req, res) {
  const { id } = req.params;
  const r = await Reservation.findById(id)
    .populate('roomId','name')
    .populate('teacherId','name')
    .populate('studentIds','name')
    .lean();
  if (!r) return res.status(404).json({ code: 40401, message: '预约不存在', data: null });
  res.json({
    code: 0,
    data: {
      _id: r._id, room: r.roomId, date: r.date, slot: r.slot,
      teacher: r.teacherId, subject: r.subject,
      students: r.studentIds, remark: r.remark
    },
    message: ''
  });
}

export async function remove(req, res) {
  const { id } = req.params;
  const r = await Reservation.findById(id);
  if (!r) return res.status(404).json({ code: 40401, message: '预约不存在', data: null });
  // 仅创建者或管理员
  if (String(r.teacherId) !== String(req.user._id) && req.user.role !== 'superAdmin') {
    return res.status(403).json({ code: 40301, message: '无权限', data: null });
  }
  await Reservation.deleteOne({ _id: id });
  res.json({ code: 0, data: true, message: '' });
}
```

```js
// server/src/controllers/scheduleController.js
import Reservation from '../models/Reservation.js';
import Room from '../models/Room.js';

export async function daySummary(req, res) {
  const { date } = req.query;
  const rooms = await Room.find().sort({ order: 1 }).lean();
  const reservations = await Reservation.find({ date }).lean();
  const byRoom = reservations.reduce((m, r) => {
    (m[r.roomId] ||= []).push(r); return m;
  }, {});
  const data = rooms.map(room => {
    const list = byRoom[room._id] || [];
    const map = new Map(list.map(r => [r.slot, r]));
    const slots = ['早1','早2','下1','下2','晚1'].map(s => {
      const r = map.get(s);
      if (!r) return { slot: s, reserved: false, restCapacity: room.type === 'small' ? 1 : room.capacity };
      const rest = room.type === 'small' ? 0 : Math.max(0, room.capacity - (r.studentIds?.length || 0));
      return { slot: s, reserved: true, restCapacity: rest, reservationId: r._id };
    });
    return { roomId: String(room._id), slots };
  });
  res.json({ code: 0, data, message: '' });
}

export async function mySchedule(req, res) {
  const { week, role } = req.query; // week: YYYY-Www
  // 简化：按 week 的起止日期再查询；此处略去换算细节，可用 dayjs.isoWeek()
  res.json({ code: 0, data: [], message: '' });
}

export async function history(req, res) {
  const { from, to, role } = req.query;
  // 根据 role 判断 teacherId 或 studentIds contains
  res.json({ code: 0, data: [], message: '' });
}
```

### `server/src/routes/*.routes.js`
```js
// server/src/routes/auth.routes.js
import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validators/auth.js';
const router = Router();
router.post('/auth/register', validate(registerSchema), register);
router.post('/auth/login', validate(loginSchema), login);
export default router;
```

```js
// server/src/routes/users.routes.js
import { Router } from 'express';
import { me, searchStudents } from '../controllers/userController.js';
import { auth, rbac } from '../middlewares/auth.js';

const router = Router();
router.get('/users/me', auth, me);
router.get('/users/students/search', auth, rbac(['teacher']), searchStudents);
export default router;
```

```js
// server/src/routes/bindings.routes.js
import { Router } from 'express';
import { auth, rbac } from '../middlewares/auth.js';
import { create, pending, patch } from '../controllers/bindingController.js';
import { validate } from '../middlewares/validate.js';
import { createBindingSchema, patchBindingSchema } from '../validators/bindings.js';

const router = Router();
router.post('/bindings', auth, rbac(['teacher']), validate(createBindingSchema), create);
router.get('/bindings/pending', auth, rbac(['student']), pending);
router.patch('/bindings/:id', auth, rbac(['student']), validate(patchBindingSchema), patch);
export default router;
```

```js
// server/src/routes/rooms.routes.js
import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import { listRooms, roomDayView } from '../controllers/roomController.js';
import { validate } from '../middlewares/validate.js';
import { roomDaySchema } from '../validators/rooms.js';
const router = Router();
router.get('/rooms', auth, listRooms);
router.get('/rooms/:id/reservations', auth, validate(roomDaySchema), roomDayView);
export default router;
```

```js
// server/src/routes/reservations.routes.js
import { Router } from 'express';
import { auth, rbac } from '../middlewares/auth.js';
import * as c from '../controllers/reservationController.js';
import * as s from '../controllers/scheduleController.js';
import { validate } from '../middlewares/validate.js';
import { createReservationSchema, reservationIdSchema, dayQuerySchema, myScheduleSchema, historyQuerySchema } from '../validators/reservations.js';

const router = Router();
router.post('/reservations', auth, rbac(['teacher']), validate(createReservationSchema), c.create);
router.get('/reservations/:id', auth, validate(reservationIdSchema), c.detail);
router.delete('/reservations/:id', auth, validate(reservationIdSchema), c.remove);

router.get('/reservations', auth, validate(dayQuerySchema), s.daySummary);
router.get('/reservations/my', auth, validate(myScheduleSchema), s.mySchedule);
router.get('/reservations/history', auth, validate(historyQuerySchema), s.history);
export default router;
```

```js
// server/src/routes/index.js
import { Router } from 'express';
import auth from './auth.routes.js';
import users from './users.routes.js';
import bindings from './bindings.routes.js';
import rooms from './rooms.routes.js';
import reservations from './reservations.routes.js';

const router = Router();
router.use(auth);
router.use(users);
router.use(bindings);
router.use(rooms);
router.use(reservations);
export default router;
```

### `server/src/app.js` 与 `server/src/server.js`
```js
// server/src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import { connectDB } from './config/db.js';

export async function createApp() {
  await connectDB();
  const app = express();
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(morgan('dev'));
  app.use('/api', routes);
  app.get('/health', (_, res) => res.json({ ok: true }));
  return app;
}
```

```js
// server/src/server.js
import { createApp } from './app.js';
import { config } from './config/env.js';

process.on('unhandledRejection', (e)=>console.error(e));
process.on('uncaughtException', (e)=>console.error(e));

const app = await createApp();
app.listen(config.port, () => console.log(`[Server] listening on :${config.port}`));
```

### `server/src/scripts/seed.js`（初始化 7 小 + 1 大）
```js
import { connectDB } from '../config/db.js';
import Room from '../models/Room.js';

await connectDB();
await Room.deleteMany({});
const docs = [
  ...Array.from({length:7}).map((_,i)=>({ name:`小教室${i+1}`, type:'small', capacity:1, order:i+1 })),
  { name:'大教室', type:'large', capacity:10, order:8 }
];
await Room.insertMany(docs);
console.log('Seeded rooms:', docs.length);
process.exit(0);
```

---

# 六、前端整合（基于你现有项目）

## 6.1 Dev Server 代理（前端→后端）
编辑 `vite.config.js`，增加 devServer 代理：
```js
// vite.config.js
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
export default defineConfig({
  plugins: [ uni() ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 后端地址
        changeOrigin: true
      }
    }
  }
})
```

## 6.2 安装 Pinia
```bash
# 在 my-vue-project/my-vue-project 下
npm i pinia
```

`src/main.js` 注入：
```js
// src/main.js
import { createSSRApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

export function createApp() {
  const app = createSSRApp(App);
  app.use(createPinia());
  return { app };
}
```

## 6.3 使用 io-modules 的 Vue 包装器（新建）

**路径建议**：`src/components/io/`

> 这些包装器直接引用 `src/io-modules/*/*.css`，并将对应 HTML 结构封装为可复用的 Vue 组件。以下为最小可用版本（可按需拓展 props/事件）。

### `src/components/io/IoCard.vue`
```vue
<template>
  <div class="card"><slot /></div>
</template>

<script setup>
// 纯展示容器
</script>

<style scoped src="@/io-modules/card/card.css"></style>
```

### `src/components/io/IoLoader.vue`
```vue
<template>
  <div class="loader" aria-label="loading" />
</template>
<script setup></script>
<style scoped src="@/io-modules/loader/loader.css"></style>
```

### `src/components/io/IoInput.vue`
```vue
<template>
  <div class="fancy-container">
    <input class="fancy" :placeholder="placeholder" :type="type" v-model="model" @input="$emit('update:modelValue', model)" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
const props = defineProps({ modelValue: String, placeholder: String, type: { type: String, default: 'text' }});
const model = ref(props.modelValue || '');
watch(()=>props.modelValue, v=> model.value = v);
</script>

<style scoped src="@/io-modules/input1/input1.css"></style>
```

### `src/components/io/IoTime.vue`（5 段“滚轮”选择）
```vue
<template>
  <div class="time-wrapper">
    <div class="picker">
      <div
        v-for="opt in options"
        :key="opt"
        :class="['picker-item', { active: opt===model }]"
        @click="select(opt)"
      >{{ opt }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
const props = defineProps({ modelValue: String, options: { type: Array, default: ()=>['早1','早2','下1','下2','晚1'] }});
const emit = defineEmits(['update:modelValue']);
const model = ref(props.modelValue || props.options[0]);
watch(()=>props.modelValue, v => model.value = v ?? props.options[0]);
function select(v){ model.value = v; emit('update:modelValue', v); }
</script>

<style scoped src="@/io-modules/time/time.css"></style>
```

> 若需要“确认/修改密码”的样式，可将 `changekey/`、`comfirmkey/` CSS 嵌入到相应输入组件中（可选）。

## 6.4 前端 API 封装

### `src/services/http.js`
```js
export function request({ url, method='GET', data, showError=true }) {
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method,
      data,
      header: {
        Authorization: `Bearer ${uni.getStorageSync('token') || ''}`
      },
      success: ({ data, statusCode }) => {
        if (statusCode >= 200 && statusCode < 300 && data?.code === 0) resolve(data.data);
        else {
          if (showError) uni.showToast({ icon:'none', title: data?.message || '请求失败' });
          reject(data);
        }
      },
      fail: (err) => { showError && uni.showToast({ icon:'none', title:'网络错误' }); reject(err); }
    });
  });
}
```

### `src/services/auth.api.js`
```js
import { request } from './http.js';
const base = '/api';
export const register = (payload)=> request({ url:`${base}/auth/register`, method:'POST', data: payload });
export const login    = (payload)=> request({ url:`${base}/auth/login`, method:'POST', data: payload });
export const me       = ()=> request({ url:`${base}/users/me` });
```

### 其他 API
```js
// src/services/users.api.js
import { request } from './http.js'; const base='/api';
export const searchStudents = (q)=> request({ url: `${base}/users/students/search`, data: q });

// src/services/bindings.api.js
import { request } from './http.js'; const base='/api';
export const createBinding = (studentId)=> request({ url:`${base}/bindings`, method:'POST', data:{ studentId } });
export const listPending   = ()=> request({ url:`${base}/bindings/pending` });
export const patchBinding  = (id, action)=> request({ url:`${base}/bindings/${id}`, method:'PATCH', data:{ action } });

// src/services/rooms.api.js
import { request } from './http.js'; const base='/api';
export const listRooms = ()=> request({ url:`${base}/rooms` });
export const roomDay   = (roomId, date)=> request({ url:`${base}/rooms/${roomId}/reservations`, data:{ date } });

// src/services/reservations.api.js
import { request } from './http.js'; const base='/api';
export const createReservation = (payload)=> request({ url:`${base}/reservations`, method:'POST', data: payload });
export const getReservation    = (id)=> request({ url:`${base}/reservations/${id}` });
export const deleteReservation = (id)=> request({ url:`${base}/reservations/${id}`, method:'DELETE' });
export const daySummary        = (date)=> request({ url:`${base}/reservations`, data:{ date } });
export const mySchedule        = (week, role)=> request({ url:`${base}/reservations/my`, data:{ week, role } });
export const historyList       = (from, to, role)=> request({ url:`${base}/reservations/history`, data:{ from, to, role } });
```

## 6.5 状态管理（Pinia）

### `src/store/auth.js`
```js
import { defineStore } from 'pinia';
import { me } from '@/services/auth.api.js';

export const useAuth = defineStore('auth', {
  state: ()=>({ token: uni.getStorageSync('token') || '', user: null }),
  actions: {
    setToken(t){ this.token = t; uni.setStorageSync('token', t); },
    async fetchMe(){ this.user = await me(); return this.user; },
    logout(){ this.token=''; this.user=null; uni.removeStorageSync('token'); uni.reLaunch({ url:'/pages/auth/login' }); }
  }
});
```

（`rooms.js`、`reservations.js`、`profile.js` 可按上一轮规划补齐。）

## 6.6 新增页面与路由（`src/pages.json`）

在 **`src/pages.json`** 中追加以下页面项（保持 index 仍为启动页）：
```json
{
  "pages": [
    { "path": "pages/index/index", "style": { "navigationBarTitleText": "uni-app" } },
    { "path": "pages/auth/login", "style": { "navigationBarTitleText": "登录" } },
    { "path": "pages/auth/register", "style": { "navigationBarTitleText": "注册" } },
    { "path": "pages/home/system", "style": { "navigationBarTitleText": "系统" } },
    { "path": "pages/profile/teacher", "style": { "navigationBarTitleText": "教师个人" } },
    { "path": "pages/profile/student", "style": { "navigationBarTitleText": "学生个人" } },
    { "path": "pages/admin/reports", "style": { "navigationBarTitleText": "报表" } }
  ]
}
```

目录与最小页面骨架（示例）：

### `src/pages/auth/login.vue`
```vue
<template>
  <view class="p20">
    <io-card>
      <io-input v-model="phone" placeholder="手机号" />
      <io-input v-model="password" type="password" placeholder="密码" />
      <button class="btn" @click="onLogin">登录</button>
    </io-card>
  </view>
</template>

<script setup>
import IoCard from '@/components/io/IoCard.vue';
import IoInput from '@/components/io/IoInput.vue';
import { login } from '@/services/auth.api.js';
import { useAuth } from '@/store/auth.js';
const store = useAuth();
const phone = ref('');
const password = ref('');

const onLogin = async () => {
  const { token } = await login({ phone: phone.value, password: password.value });
  store.setToken(token);
  await store.fetchMe();
  uni.switchTab({ url: '/pages/home/system' });
};
</script>

<style scoped>
.p20{ padding:20rpx }
.btn{ margin-top: 20rpx; padding: 20rpx; border-radius: 20rpx; background: #007AFF; color: #fff; }
</style>
```

> 其他页面（`register.vue` / `home/system.vue` / `profile/*`）可按上一轮“前端设计”版式继续拆分（重点：系统页用 `IoCard` 列出教室，每个卡片显示 5 个时段的状态；点击空闲时段打开预约抽屉 `IoTime`）。

---

# 七、基于项目包的**执行步骤**（从 0 到可跑通）

> 以下命令均在工作目录 **`my-vue-project/my-vue-project`** 执行。

## 7.1 后端搭建
1. **创建后端目录**
   - 新建 `server/`，将“五、后端文件生成器模版”中的所有文件按路径创建。
2. **安装依赖**
   ```bash
   cd server
   npm i
   ```
3. **配置环境变量（可选）**  
   新建 `.env`（或直接用默认）：
   ```
   MONGODB_URI=mongodb://<user>:<pass>@<host>:<port>/<db>?authSource=admin
   JWT_SECRET=your-secret
   REPORT_BUCKET=s3://...
   ```
4. **数据初始化**（7 小 + 1 大）
   ```bash
   npm run seed
   ```
5. **启动后端**
   ```bash
   npm run dev
   # 监听 3000 端口 /api/*
   ```

## 7.2 前端整合
1. **安装 Pinia**（已在 6.2）
2. **添加 API 封装与 Store**（`src/services/*`、`src/store/*`）
3. **添加 io-modules 包装器**（`src/components/io/*`）
4. **新增页面**并在 `src/pages.json` 中写入路由。
5. **开发代理**（已在 6.1）  
   确保访问 `uni.request({ url:'/api/...` ）会被代理到本地后端。
6. **运行前端**
   ```bash
   npm run dev:h5
   ```

## 7.3 串测用例（从空库到业务跑通）
- **注册教师** → **注册学生** → **登录教师** → **创建绑定请求**  
  - API: `POST /auth/register`、`POST /bindings`  
- **登录学生** → **同意绑定**  
  - API: `GET /bindings/pending`、`PATCH /bindings/{id}`  
- **教师进入系统页** → **拉取教室与当日时段**  
  - API: `GET /rooms`、`GET /rooms/{id}/reservations?date=YYYY-MM-DD`  
- **创建预约**（小教室只能 1 人；大教室最多 10）  
  - API: `POST /reservations`，校验冲突与容量  
- **查看详情/取消**  
  - API: `GET /reservations/{id}`、`DELETE /reservations/{id}`  
- **学生个人页查看本周安排与历史**  
  - API: `GET /reservations/my`、`GET /reservations/history`  
- **（可选）月报导出**  
  - API: `GET /reports/monthly`（后端 cron 可后续补全）

---

# 八、测试与质量

- **接口**：用 VSCode REST Client 或 Postman，根据“二、API 示例”直接构造请求。  
- **并发**：同一教室同段并发 POST，唯一索引 + 事务兜底；同教师同段跨教室并发 POST，`{ teacherId, date, slot }` 唯一索引阻止。  
- **校验**：所有路由应用 Joi；错误统一返回业务码。  
- **安全**：JWT + 角色 RBAC；手机号唯一；密码 bcrypt；CORS/Helmet。  

---

> 到这里：**前端可立即接入**这些接口、用 `src/components/io/*` 打包的 UI 组件实现苹果风 UI；后端具备可运行的最小骨架、数据模型、校验与冲突处理。  
若你希望，我也可以继续把 **`/pages/home/system.vue`**、**预约抽屉 `ReservationSheet.vue`**、**教师/学生个人页** 的**完整 SFC** 版本逐文件输出，直接落地到你的 `src/` 中。

