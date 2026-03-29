## Why

會員管理系統需要收集用戶的生日信息，以便提供個性化服務（如生日賀狀、優惠活動等）。目前系統缺少此欄位，需要在使用者註冊和個人資料頁面中新增此功能。

## What Changes

- 在使用者註冊表單中新增生日欄位（選填）
- 在會員個人資料頁面新增生日欄位，允許會員修改
- 擴展 User Entity 以儲存生日信息
- 新增相應的 API 端點支持生日欄位的讀取和修改

## Capabilities

### New Capabilities
- `birthday-field`: 在註冊流程和個人資料中新增生日欄位的完整功能，包括前後端驗證、資料庫儲存和 API 支持

### Modified Capabilities
- `user-profile`: 修改使用者個人資料功能以支援生日欄位的編輯

## Impact

**後端**:
- User Entity 新增 `birthday` 欄位（可選）
- UsersController 修改登入/註冊和個人資料 API
- 資料庫遷移：新增 `birthday` 欄位到 USER 表

**前端**:
- 註冊頁面（/signup）新增生日輸入欄位
- 個人資料頁面新增生日編輯功能
- 表單驗證和日期選擇器

**驗證範圍**:
- 單元測試：後端日期驗證
- 整合測試：API 端點功能
- 前端測試：表單提交和 UI 更新
