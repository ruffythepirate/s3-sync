const { from: uploadJobFrom } = require('./UploadFileJob')
const { from } = require('./OrchestratorJob')

const S3 = {}

jest.mock('./UploadFileJob')

const oneJobGenerator = async function * gen () { return yield * [Promise.resolve({ source: './hello', target: 's3://my-bucket/hello' })] }
const mockJob = {
  start: jest.fn()
}

let sut

beforeEach(function () {
  sut = from(S3, oneJobGenerator(), {})
  uploadJobFrom.mockReturnValue(mockJob)
})

test('start should start upload job for every item in nextGenerator', async () => {
  await sut.start()
  expect(uploadJobFrom).toHaveBeenCalledWith(S3, './hello', 's3://my-bucket/hello')
  expect(mockJob.start).toHaveBeenCalled()
})
