## ADDED Requirements

### Requirement: User can view own profile
使用者可以檢視自己的個人資料，包括基本信息和生日。

#### Scenario: User views complete profile information
- **WHEN** 已認證的使用者訪問個人資料頁面
- **THEN** 系統應顯示該使用者的完整資料（姓名、電郵、生日等）

#### Scenario: User profile contains birthday
- **WHEN** 已認證的使用者的個人資料包含生日資訊
- **THEN** 系統應在個人資料頁面中顯示該生日

#### Scenario: User profile without birthday
- **WHEN** 已認證的使用者尚未設置生日
- **THEN** 系統應在個人資料頁面中顯示提示或空欄位

### Requirement: User can update own profile
使用者可以修改自己的個人資料，包括生日。

#### Scenario: User updates profile with birthday
- **WHEN** 使用者修改個人資料表單並包含有效的生日
- **THEN** 系統應驗證資料並更新資料庫中的所有欄位

#### Scenario: User updates birthday only
- **WHEN** 使用者只修改生日欄位而保持其他欄位不變
- **THEN** 系統應更新生日欄位，保留其他欄位的現有值

#### Scenario: User clears birthday information
- **WHEN** 使用者移除已設置的生日資訊
- **THEN** 系統應接受更新，將生日設為 NULL

#### Scenario: User submits invalid birthday in profile update
- **WHEN** 使用者嘗試以無效的生日更新個人資料
- **THEN** 系統應顯示驗證錯誤，不保存任何變更

### Requirement: Profile updates require authentication
只有認證的使用者才能修改個人資料。

#### Scenario: Authenticated user updates own profile
- **WHEN** 已認證的使用者提交個人資料更新
- **THEN** 系統應進行授權檢查並允許更新

#### Scenario: User updates another user's profile
- **WHEN** 使用者嘗試修改他人的個人資料
- **THEN** 系統應回傳 403 Forbidden 錯誤

#### Scenario: Unauthenticated user attempts profile update
- **WHEN** 未經認證的使用者嘗試修改個人資料
- **THEN** 系統應回傳 401 Unauthorized 錯誤
