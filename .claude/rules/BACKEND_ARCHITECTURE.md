# 後端架構流程圖

本文件使用 Mermaid 圖表展示健身房管理系統後端的架構設計。

## 1. 整體分層架構

```mermaid
graph TB
    subgraph ClientLayer["Client Layer"]
        Client[前端應用 / API 客戶端]
    end

    subgraph ApplicationLayer["Application Layer"]
        Express[Express.js Server]

        subgraph Middlewares["Middlewares"]
            CORS[CORS]
            BodyParser[Body Parser]
            Logger[Pino Logger]
            Auth[JWT Auth Middleware]
            IsCoach[Coach Role Middleware]
        end

        subgraph Routes["Routes"]
            UsersRoute["/api/users"]
            AdminRoute["/api/admin"]
            CoachesRoute["/api/coaches"]
            CoursesRoute["/api/courses"]
            CreditRoute["/api/credit-package"]
            SkillRoute["/api/coaches/skill"]
            UploadRoute["/api/upload"]
        end

        subgraph Controllers["Controllers"]
            UsersCtrl[UsersController]
            AdminCtrl[AdminController]
            CoachesCtrl[CoachesController]
            CoursesCtrl[CoursesController]
            CreditCtrl[CreditPackageController]
            SkillCtrl[SkillController]
            UploadCtrl[UploadController]
        end

        subgraph Services["Services"]
            ConfigMgr[ConfigManager]
            JWTUtil[JWT Utils]
            LoggerUtil[Logger Utils]
            BCrypt[BCrypt]
        end
    end

    subgraph DataLayer["Data Layer"]
        DataSource[TypeORM DataSource]

        subgraph Repositories["Repositories"]
            UserRepo[UserRepository]
            CoachRepo[CoachRepository]
            CourseRepo[CourseRepository]
            BookingRepo[BookingRepository]
            CreditRepo[CreditRepository]
            SkillRepo[SkillRepository]
        end

        subgraph Entities["Entities"]
            User[User Entity]
            Coach[Coach Entity]
            Course[Course Entity]
            CourseBooking[CourseBooking Entity]
            CreditPackage[CreditPackage Entity]
            CreditPurchase[CreditPurchase Entity]
            Skill[Skill Entity]
            CoachLinkSkill[CoachLinkSkill Entity]
        end
    end

    subgraph Database["Database"]
        PostgreSQL[(PostgreSQL)]
    end

    %% 連接關係
    Client --> Express
    Express --> CORS
    CORS --> BodyParser
    BodyParser --> Logger
    Logger --> Auth

    Auth --> UsersRoute
    Auth --> AdminRoute
    Auth --> CoachesRoute
    Auth --> CoursesRoute
    Auth --> CreditRoute

    UsersRoute --> UsersCtrl
    AdminRoute --> AdminCtrl
    CoachesRoute --> CoachesCtrl
    CoursesRoute --> CoursesCtrl
    CreditRoute --> CreditCtrl
    SkillRoute --> SkillCtrl
    UploadRoute --> UploadCtrl

    UsersCtrl --> ConfigMgr
    UsersCtrl --> BCrypt
    AdminCtrl --> JWTUtil

    UsersCtrl --> DataSource
    AdminCtrl --> DataSource
    CoachesCtrl --> DataSource
    CoursesCtrl --> DataSource
    CreditCtrl --> DataSource

    DataSource --> UserRepo
    DataSource --> CoachRepo
    DataSource --> CourseRepo
    DataSource --> BookingRepo
    DataSource --> CreditRepo
    DataSource --> SkillRepo

    UserRepo --> User
    CoachRepo --> Coach
    CourseRepo --> Course
    BookingRepo --> CourseBooking
    CreditRepo --> CreditPackage
    CreditRepo --> CreditPurchase
    SkillRepo --> Skill

    User --> PostgreSQL
    Coach --> PostgreSQL
    Course --> PostgreSQL
    CourseBooking --> PostgreSQL
    CreditPackage --> PostgreSQL
    CreditPurchase --> PostgreSQL
    Skill --> PostgreSQL
    CoachLinkSkill --> PostgreSQL

    style Express fill:#4CAF50
    style DataSource fill:#2196F3
    style PostgreSQL fill:#336791
```

## 2. API 請求流程

```mermaid
sequenceDiagram
    participant C as Client
    participant M as Middlewares
    participant R as Routes
    participant Ctrl as Controllers
    participant Repo as Repository
    participant DB as PostgreSQL

    C->>M: HTTP Request
    activate M
    M->>M: CORS 驗證
    M->>M: Parse JSON Body
    M->>M: Pino 日誌記錄

    alt 需要認證的路由
        M->>M: JWT Token 驗證
        M->>M: 解析 user.id & user.role
    end

    M->>R: 轉發請求
    deactivate M
    activate R

    R->>R: 路由匹配
    R->>Ctrl: 呼叫對應 Controller
    deactivate R
    activate Ctrl

    Ctrl->>Ctrl: 驗證請求參數

    Ctrl->>Repo: 查詢/更新資料
    activate Repo
    Repo->>DB: SQL Query
    activate DB
    DB-->>Repo: 查詢結果
    deactivate DB
    Repo-->>Ctrl: Entity 資料
    deactivate Repo

    Ctrl->>Ctrl: 業務邏輯處理
    Ctrl-->>C: JSON Response
    deactivate Ctrl
```

## 3. 資料庫 Entity 關聯圖

```mermaid
erDiagram
    User ||--o| Coach : "1對1 (user_id)"
    User ||--o{ CreditPurchase : "1對多 (user_id)"
    User ||--o{ Course : "1對多 (user_id 教練)"
    User ||--o{ CourseBooking : "1對多 (user_id 學員)"

    Coach ||--o{ CoachLinkSkill : "1對多 (coach_id)"
    Coach ||--o{ Course : "1對多 (coach_id)"

    Skill ||--o{ CoachLinkSkill : "1對多 (skill_id)"
    Skill ||--o{ Course : "1對多 (skill_id)"

    Course ||--o{ CourseBooking : "1對多 (course_id)"

    CreditPackage ||--o{ CreditPurchase : "1對多 (credit_package_id)"

    User {
        uuid id PK
        string name
        string email UK
        string password
        enum role "USER, COACH, ADMIN"
        timestamp created_at
        timestamp updated_at
    }

    Coach {
        uuid id PK
        uuid user_id FK,UK
        int experience_years
        text description
        string profile_image_url
        timestamp created_at
        timestamp updated_at
    }

    Skill {
        uuid id PK
        string name UK
        timestamp created_at
    }

    CoachLinkSkill {
        uuid id PK
        uuid coach_id FK
        uuid skill_id FK
        timestamp created_at
    }

    Course {
        uuid id PK
        uuid user_id FK "教練的 user_id"
        uuid coach_id FK
        uuid skill_id FK
        string name
        text description
        timestamp start_at
        timestamp end_at
        int max_participants
        string meeting_url
        timestamp created_at
        timestamp updated_at
    }

    CourseBooking {
        uuid id PK
        uuid user_id FK
        uuid course_id FK
        timestamp created_at
        timestamp cancelled_at
    }

    CreditPackage {
        uuid id PK
        string name UK
        int credit_amount
        decimal price
        timestamp created_at
        timestamp updated_at
    }

    CreditPurchase {
        uuid id PK
        uuid user_id FK
        uuid credit_package_id FK
        int purchased_credits
        decimal price_paid
        timestamp purchase_at
    }
```

## 4. 使用者認證流程

```mermaid
flowchart TD
    Start([使用者請求]) --> HasAuth{需要認證?}

    HasAuth -->|否| DirectAccess[直接存取 API]
    HasAuth -->|是| CheckToken{檢查 Token}

    CheckToken -->|無 Token| Unauthorized[401 Unauthorized]
    CheckToken -->|有 Token| VerifyToken[JWT 驗證]

    VerifyToken -->|驗證失敗| Unauthorized
    VerifyToken -->|驗證成功| ExtractUser[解析 user.id & user.role]

    ExtractUser --> CheckRole{需要特定角色?}

    CheckRole -->|否| ProcessRequest[處理請求]
    CheckRole -->|是 COACH| IsCoach{是教練?}
    CheckRole -->|是 ADMIN| IsAdmin{是管理員?}

    IsCoach -->|否| Forbidden[403 Forbidden]
    IsCoach -->|是| ProcessRequest

    IsAdmin -->|否| Forbidden
    IsAdmin -->|是| ProcessRequest

    DirectAccess --> ProcessRequest
    ProcessRequest --> Success([回傳結果])

    Unauthorized --> End([結束])
    Forbidden --> End
    Success --> End

    style Start fill:#4CAF50
    style Success fill:#4CAF50
    style Unauthorized fill:#f44336
    style Forbidden fill:#ff9800
    style End fill:#9E9E9E
```

## 5. 登入與註冊流程

```mermaid
flowchart TD
    subgraph "註冊流程"
        SignupStart([POST /api/users/signup]) --> ValidateSignup{驗證輸入}
        ValidateSignup -->|失敗| SignupBadRequest[400 欄位未填寫正確]
        ValidateSignup -->|成功| CheckPassword{密碼格式?}
        CheckPassword -->|不符合| PasswordError[400 密碼規則錯誤]
        CheckPassword -->|符合| CheckEmail{Email 存在?}
        CheckEmail -->|是| EmailConflict[409 Email 已被使用]
        CheckEmail -->|否| HashPassword[BCrypt Hash 密碼]
        HashPassword --> CreateUser[建立使用者]
        CreateUser --> SignupSuccess[201 註冊成功]
    end

    subgraph "登入流程"
        LoginStart([POST /api/users/login]) --> ValidateLogin{驗證輸入}
        ValidateLogin -->|失敗| LoginBadRequest[400 欄位未填寫正確]
        ValidateLogin -->|成功| CheckPasswordFormat{密碼格式?}
        CheckPasswordFormat -->|不符合| LoginPasswordError[400 密碼規則錯誤]
        CheckPasswordFormat -->|符合| FindUser{查詢使用者}
        FindUser -->|不存在| LoginFailed[400 使用者不存在]
        FindUser -->|存在| ComparePassword{比對密碼}
        ComparePassword -->|不符合| LoginFailed
        ComparePassword -->|符合| GenerateToken[產生 JWT Token]
        GenerateToken --> LoginSuccess[201 登入成功 + Token]
    end

    style SignupSuccess fill:#4CAF50
    style LoginSuccess fill:#4CAF50
    style SignupBadRequest fill:#f44336
    style LoginBadRequest fill:#f44336
    style EmailConflict fill:#ff9800
    style LoginFailed fill:#f44336
```

## 6. 課程預約流程

```mermaid
flowchart TD
    Start([POST /api/courses/:courseId]) --> Auth{JWT 驗證}
    Auth -->|失敗| Unauthorized[401 請先登入]
    Auth -->|成功| GetUser[取得使用者資訊]

    GetUser --> CheckCredit{檢查剩餘堂數}
    CheckCredit -->|堂數不足| NoCredit[400 已無可使用堂數]
    CheckCredit -->|有堂數| GetCourse[查詢課程資訊]

    GetCourse -->|課程不存在| NotFound[404 課程不存在]
    GetCourse -->|課程存在| CheckParticipants{檢查人數上限}

    CheckParticipants -->|已滿| FullCourse[400 已達最大參加人數]
    CheckParticipants -->|未滿| CheckDuplicate{檢查重複預約}

    CheckDuplicate -->|已預約| Duplicate[400 已經報名過此課程]
    CheckDuplicate -->|未預約| CreateBooking[建立預約記錄]

    CreateBooking --> DeductCredit[扣除1堂數]
    DeductCredit --> BookingSuccess[201 預約成功]

    style BookingSuccess fill:#4CAF50
    style Unauthorized fill:#f44336
    style NoCredit fill:#ff9800
    style FullCourse fill:#ff9800
    style Duplicate fill:#ff9800
```

## 7. 教練建立課程流程

```mermaid
flowchart TD
    Start([POST /api/admin/coaches/courses]) --> Auth{JWT 驗證}
    Auth -->|失敗| Unauthorized[401 請先登入]
    Auth -->|成功| CheckCoach{檢查教練身份}

    CheckCoach -->|非教練| Forbidden[403 無權限]
    CheckCoach -->|是教練| ValidateInput{驗證課程資料}

    ValidateInput -->|失敗| BadRequest[400 欄位未填寫正確]
    ValidateInput -->|成功| CheckSkill{檢查專長存在}

    CheckSkill -->|不存在| SkillNotFound[404 專長不存在]
    CheckSkill -->|存在| CheckTime{檢查時間合法性}

    CheckTime -->|不合法| TimeError[400 時間設定錯誤]
    CheckTime -->|合法| GetCoachInfo[取得教練資訊]

    GetCoachInfo --> CreateCourse[建立課程]
    CreateCourse --> LinkCoach[關聯教練與課程]
    LinkCoach --> CourseSuccess[201 課程建立成功]

    style CourseSuccess fill:#4CAF50
    style Unauthorized fill:#f44336
    style Forbidden fill:#ff9800
    style BadRequest fill:#f44336
```

## 8. 配置管理架構

```mermaid
graph LR
    subgraph "Environment"
        ENV[.env 檔案]
    end

    subgraph "Config Manager"
        ConfigIndex[config/index.js]
        DBConfig[config/db.js]
        WebConfig[config/web.js]
        SecretConfig[config/secret.js]
    end

    subgraph "Application"
        DataSource[db/data-source.js]
        ExpressApp[app.js]
        JWTMiddleware[middlewares/auth.js]
    end

    ENV --> ConfigIndex
    ConfigIndex --> DBConfig
    ConfigIndex --> WebConfig
    ConfigIndex --> SecretConfig

    DBConfig --> DataSource
    WebConfig --> ExpressApp
    SecretConfig --> JWTMiddleware

    style ENV fill:#FFD700
    style ConfigIndex fill:#4CAF50
```

## 9. 測試架構

```mermaid
graph TB
    subgraph "Test Structure"
        Jest[Jest Test Runner]

        subgraph "Setup/Teardown"
            GlobalSetup[globalSetup.js<br/>建立測試資料庫連線]
            GlobalTeardown[globalTeardown.js<br/>清理測試資料]
        end

        subgraph "Test Types"
            UnitTests[test/unit/<br/>單元測試]
            IntegrationTests[test/integration/<br/>整合測試]
        end

        subgraph "Test Utils"
            TestServer[testServer.js<br/>測試伺服器實例]
            Sequencer[sequencer.js<br/>自訂執行順序]
        end
    end

    Jest --> GlobalSetup
    GlobalSetup --> UnitTests
    GlobalSetup --> IntegrationTests

    UnitTests --> GlobalTeardown
    IntegrationTests --> TestServer
    IntegrationTests --> Sequencer
    TestServer --> GlobalTeardown

    style Jest fill:#C21325
    style UnitTests fill:#4CAF50
    style IntegrationTests fill:#2196F3
```

## 10. Docker 容器架構

```mermaid
graph TB
    subgraph "Docker Compose"
        subgraph "Frontend Container"
            Frontend[Vue 3 + Vite<br/>Port: 5173]
        end

        subgraph "Backend Container"
            Backend[Express.js + TypeORM<br/>Port: 8080]
        end

        subgraph "Database Container"
            Postgres[PostgreSQL 17<br/>Port: 5432]
        end

        subgraph "Volumes"
            DBVolume[(postgres-data)]
        end
    end

    Frontend -->|HTTP API Calls| Backend
    Backend -->|SQL Queries| Postgres
    Postgres -->|Persist Data| DBVolume

    style Frontend fill:#42b883
    style Backend fill:#4CAF50
    style Postgres fill:#336791
    style DBVolume fill:#FFD700
```

## 架構特點說明

### 1. 分層架構優勢
- **關注點分離**: Routes、Controllers、Entities 各司其職
- **易於測試**: 每層可獨立進行單元測試
- **可維護性**: 修改業務邏輯不影響路由定義

### 2. TypeORM EntitySchema 模式
- 使用 JavaScript Object 定義 Entity (非 TypeScript Decorator)
- 適合純 JavaScript 專案
- 類型定義更靈活

### 3. Middleware Factory Pattern
- Auth middleware 使用工廠模式建立
- 可注入 secret 和 repository 依賴
- 提高可測試性和靈活性

### 4. 配置管理
- 使用 ConfigManager 集中管理配置
- 透過 `ConfigManager.get('db.host')` 存取
- 支援多環境配置切換

### 5. 認證與授權
- JWT Token 認證
- Role-based access control (USER, COACH, ADMIN)
- Middleware 層級的權限檢查

### 6. 測試策略
- 單元測試: 測試獨立函式和工具
- 整合測試: 測試完整 API 流程
- Custom Sequencer: 確保測試執行順序
- Test Server: 提供隔離的測試環境

### 7. 錯誤處理
- 統一錯誤處理 middleware
- 結構化錯誤回應 (status, message)
- Pino 日誌記錄所有錯誤

### 8. 容器化部署
- Docker Compose 一鍵啟動
- 服務間依賴管理 (healthcheck)
- Volume 持久化資料
- 日誌輪轉配置
