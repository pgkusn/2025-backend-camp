const {
  describe, it, expect, afterEach, beforeEach, beforeAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')
const route = '/api/users/profile'

describe(`GET ${route}`, () => {
  let server
  let token
  const testUserInfo = {
    name: '測試用戶',
    email: `${new Date().getTime()}@example.com`,
    password: 'hexSchool12345'
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
      .get(route)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.UNAUTHORIZED)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('請先登入')
  })
  it('帶入正確的token，回傳HTTP Code 200', async () => {
    const result = await server
      .get(route)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.status).toEqual('success')
    expect(result.body.data.user.name).toEqual(testUserInfo.name)
    expect(result.body.data.user.email).toEqual(testUserInfo.email)
  })

  it('取得的使用者資料應包含 birthday 欄位（可為 null）', async () => {
    const result = await server
      .get(route)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.status).toEqual('success')
    expect(result.body.data.user).toHaveProperty('birthday')
    // birthday 可能為 null 或 undefined（因為沒有在註冊時設定）
  })
  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    const userRepo = dataSource.getRepository('User')
    jest.spyOn(userRepo, 'findOne').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .get(route)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(500)
    expect(result.body.status).toEqual('error')
    expect(result.body.message).toEqual('伺服器錯誤')
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  afterAll(async () => {
    await TestServer.close()
  })
})
