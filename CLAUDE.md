# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

這是一個全端健身房管理系統,包含會員管理、教練管理、課程預約、訂單管理等功能。採用前後端分離架構,使用 Docker Compose 進行容器化部署。

## 常用指令

### 容器管理 (根目錄)

```bash
# 啟動所有服務 (資料庫、後端、前端)
npm start

# 重新建置並強制重啟所有容器
npm run restart

# 停止所有服務 (保留資料)
npm run stop

# 清除所有容器和資料 (包含 Volume)
npm run clean
```

### 後端開發 (backend/)

```bash
# 本機開發模式 (需先設定 .env 中 DB_HOST=localhost)
npm run dev

# 執行所有測試
npm test

# 執行單元測試 (含覆蓋率報告)
npm run test:unit

# 執行整合測試 (含覆蓋率報告,需資料庫連線)
npm run test:integration

# 初始化資料庫結構 (同步 TypeORM Entity 到資料庫)
npm run init:schema

# 在 Docker 容器內初始化資料庫
docker compose exec backend npm run init:schema
```

### 前端開發 (frontend/)

```bash
# 啟動開發伺服器 (支援熱重載)
npm run dev

# 建置生產版本
npm run build

# 預覽生產建置結果
npm run preview
```

### Docker 相關

```bash
# 查看服務日誌
docker compose logs -f [backend|frontend|postgres]

# 重啟特定服務
docker compose restart [backend|frontend|postgres]

# 進入後端容器
docker compose exec backend sh

# 連線 PostgreSQL
docker compose exec postgres psql -U testHexschool -d test
```

## 程式碼架構

### 後端架構 (Express.js + TypeORM)

- **分層架構**: `routes` → `controllers` → `entities`
  - `routes/`: 定義 API 路由和中介層
  - `controllers/`: 處理業務邏輯
  - `entities/`: TypeORM Entity 定義 (使用 EntitySchema,非 decorator)
  - `middlewares/`: 認證、授權等中介層

- **配置管理**: 使用 `config/` 目錄的 ConfigManager 集中管理配置
  - 透過 `ConfigManager.get('db.host')` 存取配置
  - 配置分為 `db.js`, `web.js`, `secret.js` 三個檔案

- **資料庫**: TypeORM + PostgreSQL
  - 使用 EntitySchema 模式定義 Entity (而非 decorator)
  - 資料源配置在 `db/data-source.js`
  - **重要**: `DB_SYNCHRONIZE=true` 僅用於開發,生產環境應使用 migration

- **認證**: JWT 認證
  - 使用 middleware factory pattern (`middlewares/auth.js`)
  - 需要 `secret` 和 `userRepository` 參數
  - Token 驗證失敗會回傳適當的錯誤訊息

- **日誌**: Pino
  - 使用 `utils/logger.js` 建立 logger 實例
  - 透過 `pino-http` 整合 Express

### 測試架構 (Jest)

- **測試分類**:
  - 單元測試: `test/unit/`
  - 整合測試: `test/integration/`

- **測試配置**:
  - 使用 `globalSetup.js` 和 `globalTeardown.js` 管理測試環境
  - 整合測試使用 custom sequencer (`test/sequencer.js`) 確保執行順序
  - 整合測試需要以 `-i` (sequential) 模式執行

- **測試伺服器**:
  - 使用 `test/integration/testServer.js` 建立測試用伺服器實例

### 環境變數配置

- **容器 vs 本機開發的重要差異**:
  - Docker 內: `DB_HOST=postgres` (使用 service name)
  - 本機開發: `DB_HOST=localhost`
  - 本機開發時需修改 `PORT` 避免衝突 (建議 3000)

- **關鍵環境變數**:
  - `DB_SYNCHRONIZE`: 開發時 `true`,生產時 `false`
  - `JWT_SECRET`: 生產環境必須使用強密碼
  - `LOG_LEVEL`: debug/info/warn/error

### Entity 關聯

主要 Entity 及其關聯:
- `User`: 使用者 (包含角色: user/coach/admin)
- `Coach`: 教練資料
- `CoachLinkSkill`: 教練與技能的多對多關聯
- `Skill`: 技能/專長
- `Course`: 課程
- `CourseBooking`: 課程預約
- `CreditPackage`: 點數包
- `CreditPurchase`: 點數購買記錄

### 前端架構 (Vue 3)

- **技術堆疊**: Vue 3 + Vite + Tailwind CSS 4
- **狀態管理**: Pinia
- **路由**: Vue Router
- **HTTP 客戶端**: Axios (API base URL 透過 `VITE_API_BASE_URL` 設定)

## 重要注意事項

### 資料庫操作

- Entity 使用 EntitySchema 模式,不是 decorator
- 修改 Entity 後需要執行 `npm run init:schema` 同步到資料庫 (開發環境)
- 生產環境應該使用 TypeORM migration 而非 synchronize

### 測試執行

- 整合測試**必須**以 sequential 模式執行 (`-i` flag)
- 整合測試依賴真實資料庫連線
- 測試使用 custom sequencer 來控制執行順序

### 容器化部署

- 三個服務: postgres, backend, frontend
- 使用 Docker Compose 一鍵啟動
- backend 依賴 postgres healthcheck
- 日誌自動輪轉 (max-size: 10m, max-file: 3)

### 本機開發流程

如果不想用 Docker 開發:
1. 只啟動資料庫容器: `docker compose up postgres -d`
2. 修改 `.env` 的 `DB_HOST=localhost` 和 `PORT=3000`
3. 在 `backend/` 目錄執行 `npm run dev`
4. 在 `frontend/` 目錄執行 `npm run dev`
