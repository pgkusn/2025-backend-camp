const {
  describe, it, expect, afterEach, beforeEach, beforeAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/users/signup'

describe(`POST ${route}`, () => {
  let server
  const testUserInfo = {
    name: '測試用戶',
    email: `${new Date().getTime()}@example.com`,
    password: 'hexSchool12345'
  }
  beforeAll(async () => {
    server = await TestServer.getServer()
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('帶入錯誤的註冊資訊，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        name: '測試用戶',
        password: 'hexschool12345'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })
  it('輸入格式錯誤的密碼，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        ...testUserInfo,
        password: 'hexschool12345'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
  })
  it('帶入正確的註冊資訊，回傳HTTP Code 201', async () => {
    const result = await server
      .post(route)
      .send(testUserInfo)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    expect(result.body.status).toEqual('success')
    expect(typeof result.body.data.user.id).toBe('string')
    expect(result.body.data.user.name).toEqual(testUserInfo.name)
  })
  it('輸入重複的註冊資訊，回傳HTTP Code 201', async () => {
    const result = await server
      .post(route)
      .send(testUserInfo)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CONFLICT)
    expect(result.body.status).toEqual('failed')
    // expect(typeof result.body.data.token).toBe('string');
    expect(typeof result.body.message).toBe('string')
    expect(result.body.message).toBe('Email 已被使用')
  })
  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    const spy = jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .post(route)
      .send(testUserInfo)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
    expect(result.body.status).toEqual('error')
    expect(result.body.message).toEqual('伺服器錯誤')
    spy.mockRestore()
  })

  // 生日相關測試
  it('帶入有效的生日，成功註冊並回傳HTTP Code 201', async () => {
    const userWithBirthday = {
      name: '測試生日用戶',
      email: `birthday-${new Date().getTime()}@example.com`,
      password: 'hexSchool12345',
      birthday: '2000-01-15'
    }
    const result = await server
      .post(route)
      .send(userWithBirthday)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    expect(result.body.status).toEqual('success')
    expect(typeof result.body.data.user.id).toBe('string')
    expect(result.body.data.user.name).toEqual(userWithBirthday.name)
  })

  it('不帶入生日，成功註冊並回傳HTTP Code 201', async () => {
    const userWithoutBirthday = {
      name: '測試無生日用戶',
      email: `no-birthday-${new Date().getTime()}@example.com`,
      password: 'hexSchool12345'
    }
    const result = await server
      .post(route)
      .send(userWithoutBirthday)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    expect(result.body.status).toEqual('success')
    expect(typeof result.body.data.user.id).toBe('string')
    expect(result.body.data.user.name).toEqual(userWithoutBirthday.name)
  })

  it('帶入無效的生日格式（非 YYYY-MM-DD），回傳HTTP Code 400', async () => {
    const userWithInvalidBirthday = {
      name: '測試無效生日用戶',
      email: `invalid-birthday-${new Date().getTime()}@example.com`,
      password: 'hexSchool12345',
      birthday: '01-15-2000'
    }
    const result = await server
      .post(route)
      .send(userWithInvalidBirthday)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('生日格式不正確，應為 YYYY-MM-DD')
  })

  it('帶入年齡不足 13 歲的生日，回傳HTTP Code 400', async () => {
    const today = new Date()
    const twelvePlusYearsOld = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate())
    const invalidBirthdayString = twelvePlusYearsOld.toISOString().split('T')[0]

    const userWithUnderageBirthday = {
      name: '測試未成年用戶',
      email: `underage-${new Date().getTime()}@example.com`,
      password: 'hexSchool12345',
      birthday: invalidBirthdayString
    }
    const result = await server
      .post(route)
      .send(userWithUnderageBirthday)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('年齡必須滿 13 歲')
  })

  it('帶入未來日期的生日，回傳HTTP Code 400', async () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const futureDate = tomorrow.toISOString().split('T')[0]

    const userWithFutureBirthday = {
      name: '測試未來生日用戶',
      email: `future-${new Date().getTime()}@example.com`,
      password: 'hexSchool12345',
      birthday: futureDate
    }
    const result = await server
      .post(route)
      .send(userWithFutureBirthday)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('生日不能是未來日期')
  })

  it('帶入剛好 13 歲生日當天的日期，成功註冊並回傳HTTP Code 201', async () => {
    const today = new Date()
    const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate())
    const validBirthdayString = thirteenYearsAgo.toISOString().split('T')[0]

    const userAtThirteen = {
      name: '測試 13 歲用戶',
      email: `thirteen-${new Date().getTime()}@example.com`,
      password: 'hexSchool12345',
      birthday: validBirthdayString
    }
    const result = await server
      .post(route)
      .send(userAtThirteen)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    expect(result.body.status).toEqual('success')
    expect(typeof result.body.data.user.id).toBe('string')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
  afterAll(async () => {
    await TestServer.close()
  })
})
