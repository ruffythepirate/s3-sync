const { from } = require('./UploadFileJob')
const fs = require('fs')

jest.mock('fs')

const s3 = {
  putObject: jest.fn()
}

const filePath = './file'
const s3Uri = 's3://my-bucket/file'
let sut

beforeEach(function () {
  jest.resetAllMocks()
  sut = from(s3, filePath, s3Uri)
})

function putReplyWith (err, data) {
  s3.putObject.mockImplementationOnce(function (params, cb) {
    cb(err, data)
  })
}

test('start should call s3 with correct params.', async () => {
  putReplyWith(undefined, 'data')
  const fileBuffer = Buffer.from([0, 1, 2])
  fs.readFileSync.mockReturnValue(fileBuffer)
  await sut.start()

  expect(s3.putObject).toHaveBeenCalledWith({
    Body: fileBuffer,
    Bucket: 'my-bucket',
    Key: 'file'
  }, expect.any(Function))
})

test('const should throw Error if s3Uri not start with s3://', () => {
  expect(() => {
    from(s3, filePath, 's3:/wrong/url')
  }).toThrow()
})

test('const should throw error if s3Uri doesnt contain a key', () => {
  expect(() => {
    from(s3, filePath, 's3://my-bucket/')
  }).toThrow()
})

test('start should fail when s3 call fails.', async () => {
  putReplyWith('err', undefined)
  await expect(sut.start()).rejects.toBeTruthy()
})

test('start should resolve when s3 call is successful.', async () => {
  putReplyWith(undefined, 'data')
  await expect(sut.start()).resolves.toBe('data')
})

test('job should emit events on download start.', () => {
  const eventListener = jest.fn()
  sut.on('event', eventListener)

  sut.start()

  expect(eventListener).toHaveBeenCalledTimes(1)
})

test('job should emit event on download success.', async () => {
  const eventListener = jest.fn()
  sut.on('event', eventListener)

  putReplyWith(undefined, 'success')
  await sut.start()

  expect(eventListener).toHaveBeenCalledTimes(2)
})

test('job should emit event on download fail.', async () => {
  const eventListener = jest.fn()
  sut.on('event', eventListener)

  putReplyWith('error')
  try {
    await sut.start()
  } catch {

  }

  expect(eventListener).toHaveBeenCalledTimes(2)
})
