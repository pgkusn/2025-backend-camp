const {
  describe, it, expect, afterEach, beforeEach, beforeAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')
const route = '/api/users/profile'

describe(`PUT ${route}`, () => {
  let server
  let token
  const testUserInfo = {
    name: '測試用戶',
    email: `${new Date().getTime()}@example.com`,
    password: 'hexSchool12345'
  }
  const updateUserInfo = {
    name: 'put測試用戶'
  }
  beforeAll(async () => {
    server = await TestServer.getServer()
    await server
      .post('/api/users/signup')
      .send(testUserInfo)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    const loginResult = await server
      .post('/api/users/login')
      .send({
        email: testUserInfo.email,
        password: testUserInfo.password
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    token = loginResult.body.data.token
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('未帶入token，回傳HTTP Code 401', async () => {
    const result = await server
      .put(route)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.UNAUTHORIZED)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('請先登入')
  })
  it('未帶入name，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({})
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('使用者資料未變更')
  })

  it('帶入錯誤格式的name，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        name: 123456
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })
  it('帶入相同的name，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        name: testUserInfo.name
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('使用者資料未變更')
  })

  it('更新使用者失敗，回傳HTTP Code 400', async () => {
    const userRepo = dataSource.getRepository('User')
    jest.spyOn(userRepo, 'update').mockImplementation(() => ({
      affected: 0
    }))
    const result = await server
      .put(route)
      .send(updateUserInfo)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('更新使用者資料失敗')
  })

  it('帶入正確的token，回傳HTTP Code 200', async () => {
    const result = await server
      .put(route)
      .send(updateUserInfo)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.status).toEqual('success')
    expect(result.body.data.user.name).toEqual(updateUserInfo.name)
  })

  // 生日更新相關測試
  it('成功更新使用者生日，回傳HTTP Code 200', async () => {
    const result = await server
      .put(route)
      .send({
        birthday: '2000-05-20'
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.status).toEqual('success')
    expect(result.body.data.user.birthday).toEqual('2000-05-20')
  })

  it('成功清除使用者生日（設為空），回傳HTTP Code 200', async () => {
    // 先設定生日
    await server
      .put(route)
      .send({
        birthday: '1995-03-15'
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect(StatusCodes.OK)

    // 再清除生日
    const result = await server
      .put(route)
      .send({
        birthday: ''
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.status).toEqual('success')
    expect(result.body.data.user.birthday === null || result.body.data.user.birthday === undefined).toBe(true)
  })

  it('同時更新名稱和生日，回傳HTTP Code 200', async () => {
    const newName = 'updated-name-birthday'
    const newBirthday = '1998-07-10'

    const result = await server
      .put(route)
      .send({
        name: newName,
        birthday: newBirthday
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.status).toEqual('success')
    expect(result.body.data.user.name).toEqual(newName)
    expect(result.body.data.user.birthday).toEqual(newBirthday)
  })

  it('帶入無效的生日格式，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        birthday: '05-20-2000'
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('生日格式不正確，應為 YYYY-MM-DD')
  })

  it('帶入年齡不足 13 歲的生日，回傳HTTP Code 400', async () => {
    const today = new Date()
    const twelvePlusYearsOld = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate())
    const invalidBirthdayString = twelvePlusYearsOld.toISOString().split('T')[0]

    const result = await server
      .put(route)
      .send({
        birthday: invalidBirthdayString
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('年齡必須滿 13 歲')
  })

  it('帶入未來日期的生日，回傳HTTP Code 400', async () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const futureDate = tomorrow.toISOString().split('T')[0]

    const result = await server
      .put(route)
      .send({
        birthday: futureDate
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('生日不能是未來日期')
  })

  it('只更新生日且沒有變更，回傳HTTP Code 400', async () => {
    // 先設定生日
    const birthday = '1995-03-15'
    await server
      .put(route)
      .send({
        birthday
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect(StatusCodes.OK)

    // 再用相同生日更新
    const result = await server
      .put(route)
      .send({
        birthday
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('使用者資料未變更')
  })

  it('檢驗只能修改自己的記錄（授權檢查）', async () => {
    // 建立第二個使用者
    const secondUserInfo = {
      name: '第二個測試用戶',
      email: `second-${new Date().getTime()}@example.com`,
      password: 'hexSchool12345'
    }
    await server
      .post('/api/users/signup')
      .send(secondUserInfo)
      .set('Accept', 'application/json')
      .expect(StatusCodes.CREATED)

    const secondUserLogin = await server
      .post('/api/users/login')
      .send({
        email: secondUserInfo.email,
        password: secondUserInfo.password
      })
      .set('Accept', 'application/json')
      .expect(StatusCodes.CREATED)

    const secondUserToken = secondUserLogin.body.data.token

    // 第二個使用者用自己的 token 更新自己的生日，應該成功
    const result = await server
      .put(route)
      .send({
        birthday: '1992-12-25'
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${secondUserToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)

    expect(result.body.status).toEqual('success')
    expect(result.body.data.user.birthday).toEqual('1992-12-25')
  })
  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    const userRepo = dataSource.getRepository('User')
    jest.spyOn(userRepo, 'update').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .put(route)
      .send({
        name: testUserInfo.name
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
    expect(result.body.status).toEqual('error')
    expect(result.body.message).toEqual('伺服器錯誤')
  })
  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })
  afterAll(async () => {
    await TestServer.close()
  })
})
