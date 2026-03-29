const {
  describe, it, expect, beforeEach
} = require('@jest/globals')

const UserEntity = require('../../entities/User')

describe('Test - User Entity Birthday Field', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const columns = UserEntity.options.columns

  // 測試 Entity 定義
  it('Entity 應該被正確定義', () => {
    expect(UserEntity).toBeDefined()
    expect(UserEntity.options.tableName).toEqual('USER')
  })

  // 測試生日欄位存在
  it('Entity 應該有 birthday 欄位', () => {
    expect(columns).toBeDefined()
    expect(columns.birthday).toBeDefined()
  })

  // 測試生日欄位類型
  it('birthday 欄位應該是 DATE 類型', () => {
    expect(columns.birthday.type).toEqual('date')
  })

  // 測試生日欄位為可選
  it('birthday 欄位應該允許 NULL（nullable: true）', () => {
    expect(columns.birthday.nullable).toBe(true)
  })

  // 測試生日欄位不是主鍵
  it('birthday 欄位不應該是主鍵', () => {
    expect(columns.birthday.primary).not.toBe(true)
  })

  // 測試生日欄位不是唯一鍵
  it('birthday 欄位不應該是唯一鍵', () => {
    expect(columns.birthday.unique).not.toBe(true)
  })

  // 測試其他必需欄位仍然存在
  it('應該有 id 欄位（主鍵）', () => {
    expect(columns.id).toBeDefined()
    expect(columns.id.primary).toBe(true)
    expect(columns.id.type).toEqual('uuid')
  })

  it('應該有 email 欄位（唯一鍵）', () => {
    expect(columns.email).toBeDefined()
    expect(columns.email.unique).toBe(true)
    expect(columns.email.nullable).toBe(false)
  })

  it('應該有 name 欄位（必填）', () => {
    expect(columns.name).toBeDefined()
    expect(columns.name.nullable).toBe(false)
  })

  it('應該有 password 欄位（必填）', () => {
    expect(columns.password).toBeDefined()
    expect(columns.password.nullable).toBe(false)
  })

  it('應該有 role 欄位（必填）', () => {
    expect(columns.role).toBeDefined()
    expect(columns.role.nullable).toBe(false)
  })

  it('應該有 created_at 欄位', () => {
    expect(columns.created_at).toBeDefined()
    expect(columns.created_at.createDate).toBe(true)
  })

  it('應該有 updated_at 欄位', () => {
    expect(columns.updated_at).toBeDefined()
    expect(columns.updated_at.updateDate).toBe(true)
  })

  // 測試所有欄位列表
  it('應該有正確數量的欄位（包括 birthday）', () => {
    const columnNames = Object.keys(columns)
    expect(columnNames).toContain('id')
    expect(columnNames).toContain('name')
    expect(columnNames).toContain('email')
    expect(columnNames).toContain('role')
    expect(columnNames).toContain('password')
    expect(columnNames).toContain('created_at')
    expect(columnNames).toContain('updated_at')
    expect(columnNames).toContain('birthday')
  })

  // 測試欄位配置
  it('birthday 欄位應該沒有 default 值', () => {
    expect(columns.birthday.default).not.toBeDefined()
  })

  it('birthday 欄位應該沒有長度限制', () => {
    expect(columns.birthday.length).not.toBeDefined()
  })
})
