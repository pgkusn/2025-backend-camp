## 1. 後端 - 資料庫與 Entity

- [ ] 1.1 修改 `backend/src/entities/User.ts` 的 EntitySchema 定義，新增 `birthday` 欄位（DATE 類型，可選）
- [ ] 1.2 執行 `npm run init:schema` 同步資料庫結構（development 環境）
- [ ] 1.3 驗證 PostgreSQL 中 USER 表已正確添加 `birthday` 欄位

## 2. 後端 - API 端點與驗證

- [ ] 2.1 修改 `backend/src/routes/users.ts` - 更新 POST `/api/users/signup` 端點，接受 `birthday` 欄位
- [ ] 2.2 在 UsersController 添加生日驗證邏輯：驗證日期格式（YYYY-MM-DD）、最少年齡（13 歲）、不能是未來日期
- [ ] 2.3 修改 `backend/src/routes/users.ts` - 更新 PUT `/api/users/profile` 端點，支援編輯 `birthday` 欄位
- [ ] 2.4 確保修改個人資料的端點只允許使用者修改自己的記錄（檢查 JWT token 中的 user.id）

## 3. 後端 - 單元測試

- [ ] 3.1 在 `backend/test/unit/` 建立生日驗證測試：測試有效日期、無效格式、未來日期、年齡限制
- [ ] 3.2 編寫單元測試驗證 Entity 正確儲存和檢索生日欄位

## 4. 後端 - 整合測試

- [ ] 4.1 在 `backend/test/integration/` 測試 POST `/api/users/signup` 包含生日的場景
- [ ] 4.2 在 `backend/test/integration/` 測試 PUT `/api/users/profile` 更新生日的場景
- [ ] 4.3 測試授權檢查：驗證使用者只能修改自己的生日
- [ ] 4.4 執行 `npm run test:integration` 確認所有整合測試通過

## 5. 前端 - 註冊頁面

- [ ] 5.1 修改 `frontend/src/views/SignupView.vue`（或相應的註冊頁面），添加生日欄位
- [ ] 5.2 添加 HTML5 `<input type="date">` 欄位與 Tailwind CSS 樣式
- [ ] 5.3 更新註冊表單的數據模型，包含 `birthday` 欄位
- [ ] 5.4 更新表單提交邏輯，將生日包含在請求中

## 6. 前端 - 個人資料頁面

- [ ] 6.1 修改 `frontend/src/views/ProfileView.vue`（或相應的個人資料頁面），添加生日顯示欄位
- [ ] 6.2 添加生日編輯功能，使用 `<input type="date">` 欄位
- [ ] 6.3 更新 Pinia store（如 `userStore`）以管理生日狀態
- [ ] 6.4 實作保存生日變更的 API 呼叫（使用 Axios）

## 7. 前端 - 表單驗證與提示

- [ ] 7.1 添加前端表單驗證：生日欄位格式、年齡限制、不能是未來日期
- [ ] 7.2 添加用戶友善的驗證錯誤提示訊息
- [ ] 7.3 添加加載和錯誤狀態的 UI 反饋

## 8. 前端 - 單元測試

- [ ] 8.1 編寫註冊頁面表單驗證的單元測試
- [ ] 8.2 編寫個人資料頁面生日欄位的單元測試
- [ ] 8.3 編寫 Pinia store 生日狀態管理的測試

## 9. 前端 - 功能測試（使用 webapp-testing）

- [ ] 9.1 使用 playwright 測試註冊流程：填寫生日並提交
- [ ] 9.2 使用 playwright 測試個人資料頁面：檢視和編輯生日
- [ ] 9.3 測試表單驗證錯誤場景（無效日期、未來日期等）

## 10. 整合驗證與測試

- [ ] 10.1 啟動完整的應用（`npm start`）
- [ ] 10.2 執行後端完整測試套件：`npm run test`（單元 + 整合）
- [ ] 10.3 執行前端測試套件
- [ ] 10.4 人工測試：註冊新使用者並設置生日
- [ ] 10.5 人工測試：在個人資料頁面修改生日並驗證保存
- [ ] 10.6 驗證資料庫中的生日欄位已正確更新
- [ ] 10.7 測試邊界情況：空生日、無效格式、授權檢查

## 11. 提交與歸檔

- [ ] 11.1 使用 `commit` 技能提交所有更改（慣例提交格式）
- [ ] 11.2 使用 `/opsx:archive` 命令歸檔該變更
