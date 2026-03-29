## ADDED Requirements

### Requirement: User can provide birthday during registration
使用者在註冊時可以選擇性地提供生日資訊。

#### Scenario: User submits birthday during signup
- **WHEN** 使用者在註冊表單中填入有效的生日並提交
- **THEN** 系統應接受該生日並儲存到資料庫

#### Scenario: User omits birthday during signup
- **WHEN** 使用者在註冊時不填寫生日欄位
- **THEN** 系統應允許註冊完成，生日欄位為 NULL

#### Scenario: User submits invalid birthday format
- **WHEN** 使用者提交無效的日期格式
- **THEN** 系統應顯示驗證錯誤訊息，拒絕提交

#### Scenario: User submits unrealistic birthday
- **WHEN** 使用者提交未來日期或表示年齡不足 13 歲的日期
- **THEN** 系統應顯示驗證錯誤訊息，拒絕提交

### Requirement: User can view and edit birthday in profile
使用者可在個人資料頁面檢視和修改自己的生日資訊。

#### Scenario: User views own birthday
- **WHEN** 使用者進入個人資料頁面
- **THEN** 系統應顯示已儲存的生日（如果存在），或提示欄位為空

#### Scenario: User adds birthday to existing profile
- **WHEN** 使用者在個人資料頁面填入生日並保存
- **THEN** 系統應驗證並更新資料庫中的生日欄位

#### Scenario: User modifies existing birthday
- **WHEN** 使用者修改個人資料中的生日並保存
- **THEN** 系統應驗證新的生日並更新資料庫

#### Scenario: User attempts to submit invalid birthday edit
- **WHEN** 使用者在個人資料頁面修改為無效的生日
- **THEN** 系統應顯示驗證錯誤，不保存變更

### Requirement: Birthday field is only accessible to the owner
只有使用者本人可檢視和修改自己的生日資訊。

#### Scenario: User views own birthday
- **WHEN** 已認證的使用者嘗試檢視自己的個人資料
- **THEN** 系統應回傳該使用者的完整資料包括生日

#### Scenario: User attempts to modify another user's birthday
- **WHEN** 使用者嘗試修改他人的個人資料中的生日
- **THEN** 系統應回傳 403 Forbidden 錯誤

#### Scenario: Unauthenticated user attempts to access birthday
- **WHEN** 未經認證的使用者嘗試存取生日資訊
- **THEN** 系統應回傳 401 Unauthorized 錯誤
