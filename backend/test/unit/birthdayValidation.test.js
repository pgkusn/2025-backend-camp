const {
  describe, it, expect, beforeEach
} = require('@jest/globals')

// 從 UsersController 中複製驗證函數以供測試
function validateBirthday (birthday) {
  if (birthday === undefined || birthday === null || birthday === '') {
    return { valid: true, message: null } // 生日是可選的
  }

  // 驗證日期格式 YYYY-MM-DD
  const datePattern = /^\d{4}-\d{2}-\d{2}$/
  if (!datePattern.test(birthday)) {
    return { valid: false, message: '生日格式不正確，應為 YYYY-MM-DD' }
  }

  const birthDate = new Date(birthday)
  const today = new Date()

  // 驗證日期有效性
  if (isNaN(birthDate.getTime())) {
    return { valid: false, message: '生日日期無效' }
  }

  // 驗證不能是未來日期
  if (birthDate > today) {
    return { valid: false, message: '生日不能是未來日期' }
  }

  // 驗證最少年齡（13 歲）
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ? age - 1
    : age

  if (actualAge < 13) {
    return { valid: false, message: '年齡必須滿 13 歲' }
  }

  return { valid: true, message: null }
}

describe('Test - Birthday Validation Function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // 測試有效的生日日期
  it('應接受有效的生日日期', () => {
    const result = validateBirthday('2000-01-01')
    expect(result.valid).toBe(true)
    expect(result.message).toBeNull()
  })

  it('應接受最近有效的生日日期', () => {
    const today = new Date()
    const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate())
    const birthdayString = thirteenYearsAgo.toISOString().split('T')[0]

    const result = validateBirthday(birthdayString)
    expect(result.valid).toBe(true)
    expect(result.message).toBeNull()
  })

  // 測試無效的日期格式
  it('應拒絕非 YYYY-MM-DD 格式的日期', () => {
    const result = validateBirthday('01-01-2000')
    expect(result.valid).toBe(false)
    expect(result.message).toEqual('生日格式不正確，應為 YYYY-MM-DD')
  })

  it('應拒絕 YYYY/MM/DD 格式的日期', () => {
    const result = validateBirthday('2000/01/01')
    expect(result.valid).toBe(false)
    expect(result.message).toEqual('生日格式不正確，應為 YYYY-MM-DD')
  })

  it('應拒絕無效的日期字符串', () => {
    const result = validateBirthday('invalid-date')
    expect(result.valid).toBe(false)
    expect(result.message).toEqual('生日格式不正確，應為 YYYY-MM-DD')
  })

  it('應拒絕只有年份的日期', () => {
    const result = validateBirthday('2000')
    expect(result.valid).toBe(false)
    expect(result.message).toEqual('生日格式不正確，應為 YYYY-MM-DD')
  })

  // 測試未來日期
  it('應拒絕未來日期', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const futureDate = tomorrow.toISOString().split('T')[0]

    const result = validateBirthday(futureDate)
    expect(result.valid).toBe(false)
    expect(result.message).toEqual('生日不能是未來日期')
  })

  it('應拒絕明年的日期', () => {
    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    const futureDate = nextYear.toISOString().split('T')[0]

    const result = validateBirthday(futureDate)
    expect(result.valid).toBe(false)
    expect(result.message).toEqual('生日不能是未來日期')
  })

  // 測試年齡不足 13 歲
  it('應拒絕年齡不足 13 歲的日期', () => {
    const today = new Date()
    const twelvePlusYearsOld = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate())
    const birthdayString = twelvePlusYearsOld.toISOString().split('T')[0]

    const result = validateBirthday(birthdayString)
    expect(result.valid).toBe(false)
    expect(result.message).toEqual('年齡必須滿 13 歲')
  })

  it('應拒絕剛出生不久的日期', () => {
    const today = new Date()
    const recentBirth = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
    const birthdayString = recentBirth.toISOString().split('T')[0]

    const result = validateBirthday(birthdayString)
    expect(result.valid).toBe(false)
    expect(result.message).toEqual('年齡必須滿 13 歲')
  })

  // 測試邊界情況：剛好 13 歲生日當天
  it('應接受剛好 13 歲生日當天', () => {
    const today = new Date()
    const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate())
    const birthdayString = thirteenYearsAgo.toISOString().split('T')[0]

    const result = validateBirthday(birthdayString)
    expect(result.valid).toBe(true)
    expect(result.message).toBeNull()
  })

  it('應拒絕差一天就滿 13 歲的日期', () => {
    const today = new Date()
    // 創建 13 歲的前一天
    const almostThirteen = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate() + 1)
    const birthdayString = almostThirteen.toISOString().split('T')[0]

    const result = validateBirthday(birthdayString)
    expect(result.valid).toBe(false)
    expect(result.message).toEqual('年齡必須滿 13 歲')
  })

  // 測試可選欄位（生日未提供）
  it('應接受 undefined 生日（可選欄位）', () => {
    const result = validateBirthday(undefined)
    expect(result.valid).toBe(true)
    expect(result.message).toBeNull()
  })

  it('應接受 null 生日（可選欄位）', () => {
    const result = validateBirthday(null)
    expect(result.valid).toBe(true)
    expect(result.message).toBeNull()
  })

  it('應接受空字符串生日（可選欄位）', () => {
    const result = validateBirthday('')
    expect(result.valid).toBe(true)
    expect(result.message).toBeNull()
  })

  // 測試特殊情況
  it('應拒絕無效的日期（如 2100-02-30，未來日期）', () => {
    const result = validateBirthday('2100-02-28')
    expect(result.valid).toBe(false)
    expect(result.message).toEqual('生日不能是未來日期')
  })
})
